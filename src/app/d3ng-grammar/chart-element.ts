import * as d3 from "d3";
import * as moment from 'moment';

export abstract class ChartElement {
  abstract registerLayout(registry: (orientation: LayoutOrientation, size: number) => any): void;
  abstract layout(dimensions: LayoutDimensions): void;

  abstract registerVariables(registry: (fieldSpec: FieldSpec) => FieldDeclaration);
  abstract render(data: Object[]);
}

export enum LayoutOrientation { top, bottom, left, right, content, chart }

export interface LayoutDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FieldSpec = FieldDeclaration|string;

export enum FieldTypes { quantitative, ordinal, nominal, date }

export interface FieldDeclaration {
  key?: string;
  field?: string;
  type?: string;
  format?: string;
  domain?: number[];
  range?: number[];
  value?: (Object) => any;
  scale?: (any) => any;
  project?: (Object) => any;
}

export class FieldRegistry {
  private fields = new Map<string, FieldDeclaration>();

  /**
   * Takes a field specification and adds it to the registry if necessary. The field spec is completed based on
   * defaults, data, or existing field specs.
   */
  public explicite<T>(spec: FieldSpec, data: Object[], defaultRange?: number[]): FieldDeclaration {
    let dclr: FieldDeclaration = null;
    if (typeof spec === "string") {
      dclr = this.fields.get(spec as string);
      if (!dclr) {
        dclr = {
          key: spec
        };
        this.fields.set(spec as string, dclr);
      }
    } else {
      let key = (spec as FieldDeclaration).key;
      if (!key) {
        key = (spec as FieldDeclaration).field;
      }
      dclr = this.fields.get(key);
      if (!dclr) {
        dclr = spec;
        this.fields.set(key, dclr);
      } else {
        Object.keys(spec).forEach(key => dclr[key] = spec[key]);
      }
    }

    if (!dclr.key) {
      dclr.key = dclr.field;
    }

    if (!dclr.value) {
      if (!dclr.field) {
        dclr.field = dclr.key;
      }
      dclr.value = (o: Object) => o[dclr.field];
    }

    if (!dclr.type) {
      const datum = data.find(datum => datum && dclr.value(datum));
      if (datum) {
        const value = dclr.value(datum);
        if (typeof value === "number") {
          dclr.type = FieldTypes[FieldTypes.quantitative];
        } else if (typeof value === "string") {
          if (typeof Number(value) === "number") {
            dclr.type = FieldTypes[FieldTypes.quantitative];
            const oldValueFunction = dclr.value;
            dclr.value = datum => Number(oldValueFunction(datum));
          }
        } else {
          // TODO
          console.log(`WARNING: Cannot gues data type for datum ${value} (${typeof value}))`);
        }
      } else {
        // TODO
      }
    } else if (FieldTypes[dclr.type] === FieldTypes.date) {
      if (!(dclr.value as any).forType) {
        const oldValueFunction = dclr.value;
        dclr.value = datum => moment(oldValueFunction(datum), dclr.format).dayOfYear();
        (dclr.value as any).forType = true;
      }
    }

    if (!dclr.scale) {
      if (FieldTypes[dclr.type] === FieldTypes.quantitative || FieldTypes[dclr.type] === FieldTypes.date) {
        if (!dclr.domain) {
          const extent = d3.extent(data.map(dclr.value));
          const size = extent[1] - extent[0];
          dclr.domain = [extent[0] - size * 0.1, extent[1] + size * 0.1];
        }

        if (!dclr.range) {
          dclr.range = defaultRange;
        }

        dclr.scale = d3.scale.linear().domain(dclr.domain).range(dclr.range);
      } else {
        // TODO
      }
    }

    if (!dclr.project) {
      dclr.project = (datum: Object) => dclr.scale(dclr.value(datum));
    }

    return dclr;
  }
}

