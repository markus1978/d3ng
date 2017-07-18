import * as d3 from "d3";

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

export enum FieldTypes { quantitative, ordinal, nominal }

export interface FieldDeclaration {
  key?: string;
  field?: string;
  type?: FieldTypes;
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
      if (typeof dclr.value(datum) === "number") {
        dclr.type = FieldTypes.quantitative;
      } else {
        // TODO
      }
    }

    if (!dclr.scale) {
      if (dclr.type == FieldTypes.quantitative) {
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

