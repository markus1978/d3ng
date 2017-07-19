import * as d3 from "d3";
import * as moment from "moment";

enum VariableTypes { quantitative, temporal, ordinal }
enum AggregationFunctions { mean, middle }

export class Variable {
  field: string = null;
  key: string = null;
  type: VariableTypes = VariableTypes.quantitative;
  format: string = null;
  timeUnit: string = null;

  bins: number = null;
  binSize: number = null;
  aggregation: AggregationFunctions = null;

  value: (datum: Object) => any = null;
  doBin: (data: Object[]) => Object[][];
  doAggregate: (data: Object[]) => any;
  width: (datum: Object) => number = null;

  domain: number[] = null;
  range: number[] = null;
  scale: (value) => number = null;
  project: (datum: Object) => number = this.defaultProject;

  keyGen = this.defaultKeyGen;
  valueGen = this.defaultValueGen;
  scaleGen = this.defaultScaleGen;
  domainGen = this.defaultDomainGen;
  doBinGen = this.defaultDoBinGen;
  doAggregateGen = this.defaultDoAggregateGen;

  defaultKeyGen(): string {
    return this.field;
  }

  defaultValueGen(data: Object[]) {
    const baseValue = datum => datum[this.key];
    let value = baseValue;
    if (this.type === VariableTypes.temporal) {
      if (this.timeUnit == "month") {
        value = datum => {
          const value = baseValue(datum);
          if (typeof value === 'string') {
            return moment(value, this.format).month();
          } else {
            return value;
          }
        };
      } else {
        throw new Error(`Unkown or undefined timeUnit ${this.timeUnit}.`);
      }
    } else if (this.type === VariableTypes.quantitative) {
      if (data.length > 0) {
        const firstBaseValue = baseValue(data[0]);
        if (typeof firstBaseValue === "string") {
          value = datum => Number(baseValue(datum));
        }
      }
    }

    return value;
  }

  defaultProject(datum: Object): number {
    return this.scale(this.value(datum));
  }

  defaultDomainGen(data: Object[]): number[] {
    const extent = d3.extent(data.map(datum => this.value(datum)));
    if (this.bins && this.binSize) {
      extent[0] -= this.binSize * 0.5;
      extent[1] += this.binSize * 0.5;
    }
    return extent;
  }

  defaultScaleGen() {
    const scale = d3.scale.linear().domain(this.domain);
    if (this.range) {
      scale.range(this.range);
    }
    return scale;
  }

  defaultDoBinGen() {
    if (this.bins || this.binSize) {
      return (data: Object[]) => {
        if (this.binSize && !this.bins) {
          this.bins = (this.domain[1] - this.domain[0]) / this.binSize;
        }

        if (!this.binSize) {
          this.binSize = (this.domain[1] - this.domain[0]) / (this.bins - 1);
        }

        const result = new Array(this.bins);
        for (let i = 0; i < this.bins; i++) {
          result[i] = new Array();
          result[i].__bin = i;
        }
        data.forEach(datum => {
          const value = this.value(datum);
          let index = Math.trunc((value - this.domain[0]) / this.binSize);
          if (index == this.bins) {
            index = this.bins - 1;
          }
          result[index].push(datum);
        });
        return result;
      };
    } else {
      return null;
    }
  }

  defaultDoAggregateGen() {
    let aggregation = this.aggregation;
    if (!aggregation) {
      if (this.bins) {
        aggregation = AggregationFunctions.middle;
      } else {
        aggregation = AggregationFunctions.mean;
      }
    }

    if (aggregation === AggregationFunctions.mean) {
      return (data: Object[]) => {
        let sum = 0;
        data.forEach(datum => {
          sum += this.value(datum);
        });
        return sum / data.length;
      };
    } else if (aggregation === AggregationFunctions.middle) {
      return (data: Object[]) => {
        const bin = (data as any).__bin;
        return this.binSize * (bin + 0.5) + this.domain[0];
      };
    } else {
      throw new Error(`Unknown aggregation function ${aggregation}.`);
    }
  }

  constructor(spec: any) {
    if (typeof spec === "string") {
      this.field = spec;
      this.key = this.keyGen();
    } else {
      this.update(spec);
    }
  }

  update(spec: any) {
    const specActualKeys = Object.keys(spec);

    specActualKeys.forEach(key => {
      const isPossibleKey = !(this[key] === undefined);
      if (isPossibleKey) {
        if (key == "type" && typeof spec.type === "string") {
          this.type = VariableTypes[spec.type as string];
          if (this.type === undefined) {
            throw new Error(`Unknown variable type ${spec.type}.`);
          }
        } else if (key == "aggregation" && typeof spec.aggregation === "string") {
          this.aggregation = AggregationFunctions[spec.aggregation as string];
          if (this.aggregation === undefined) {
            throw new Error(`Unknown aggregation ${spec.aggregation}.`);
          }
        } else {
          this[key] = spec[key];
        }
      } else {
        throw new Error(`Unknown variable specification property ${key}.`);
      }
    });

    if (!this.key) {
      this.key = this.keyGen();
    }
  }

  initBeforeBinning(data: Object[], range: number[]) {
    if (!this.value) {
      this.value = this.valueGen(data);
    }
    if (!this.range) {
      this.range = range;
    }
    if (!this.doBin) {
      this.doBin = this.doBinGen();
    }
    if (!this.doAggregate) {
      this.doAggregate = this.doAggregateGen();
    }

    if (!this.domain) {
      this.domain = this.domainGen(data);
      (this.domain as any).__generated = [0, 1];
    } else if (this.domain[0] === null || this.domain[1] === null) {
      const generatedDomain = this.domainGen(data);
      const generatedIndexes = [0, 1].filter(index => this.domain[index] === null);
      generatedIndexes.forEach(index => this.domain[index] = generatedDomain[index]);
      (this.domain as any).__generated = generatedIndexes;
    }
  }

  initAfterBinning(data: Object[]) {
    if (!this.domain || (this.domain as any).__generated) {
      const generatedDomain = this.domainGen(data);
      (this.domain as any).__generated.forEach(index => this.domain[index] = generatedDomain[index]);
    }
    if (!this.scale) {
      this.scale = this.scaleGen();
    }
  }
}

export class VariableRegistry {

  private variableDefinitions = new Map<string, Variable>();
  private last: Variable[] = [];

  public register(spec: any, data: Object[], range?: number[]): Variable {
    if (spec.fields) {
      let firstResult: Variable = null;
      spec.fields.forEach(field => {
        const copy = JSON.parse(JSON.stringify(spec));
        delete copy.fields;
        copy.field = field;
        const result = this.register(copy, data, range);
        if (!firstResult) {
          firstResult = result;
        }
      });
      return firstResult;
    }

    let variable: Variable;
    let key: string = null;
    let isRef = false;
    if (typeof spec === "string") {
      key = spec;
      isRef = true;
    } else {
      key = spec.key ? spec.key : spec.field;
    }
    variable = this.variableDefinitions.get(key);
    if (!variable) {
      variable = new Variable(spec);
      this.variableDefinitions.set(key, variable);
    } else if (!isRef) {
      variable.update(spec);
    }

    if (!isRef) {
      variable.initBeforeBinning(data, range);
    }

    this.last.push(variable);

    return variable;
  }

  computeBinning(source: Object[]): Object[] {
    const binningVariable = this.last.find(variable => variable.doBin != null);
    if (binningVariable == null) {
      return source;
    }

    const bins = binningVariable.doBin(source);
    const result = new Array(bins.length);
    for (let i = 0; i < bins.length; i++) {
      const target = {};
      this.last.forEach(variable => {
        target[variable.field] = variable.doAggregate(bins[i]);
      });
      result[i] = target;
    }

    this.last.forEach(variable => variable.initAfterBinning(result));

    return result;
  }
}
