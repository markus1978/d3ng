import {
  ContentChildren, Directive, DoCheck, ElementRef,
  Input, OnInit,
  QueryList,
} from "@angular/core";
import * as d3 from "d3";
import { AxisDirective} from "./axis.directive";
import {CircleMarkDirective} from "./circle-mark.directive";


@Directive({ selector: '[d3ng-chart]' })
export class ChartDirective implements DoCheck {

  @ContentChildren(AxisDirective) axis: QueryList<AxisDirective>;
  @ContentChildren(CircleMarkDirective) marks: QueryList<CircleMarkDirective>;

  private isLayouted = false;

  private _data: object[] = null;
  @Input() set data(value: object[]) {
    this._data = value;
    this.updateData();
  }

  private g: any = null;
  constructor(private elRef: ElementRef) {
    this.g = d3.select(elRef.nativeElement);
  }

  ngDoCheck() {
    if (this.axis && !this.isLayouted) {

      const native = this.elRef.nativeElement;
      const contentDimensions = {
        x: 0, y: 0, width: native.clientWidth, height: native.clientHeight
      };
      this.axis.forEach(axis => {
        if (axis.orientation == "left") {
          contentDimensions.x += axis.size;
          contentDimensions.width -= axis.size;
        } else if (axis.orientation == "bottom") {
          contentDimensions.height -= axis.size;
        } else if (axis.orientation == "right") {
          contentDimensions.width -= axis.size;
        } else if (axis.orientation == "top") {
          contentDimensions.y += axis.size;
          contentDimensions.height -= axis.size;
        }
      });
      this.axis.forEach(axis => {
        if (axis.orientation == "left") {
          axis.dimensions = {
            x: 0, y: contentDimensions.y, width: axis.size, height: contentDimensions.height
          };
        } else if (axis.orientation == "bottom") {
          axis.dimensions = {
            x: contentDimensions.x, y: native.clientHeight - axis.size, width: contentDimensions.width, height: axis.size
          };
        } else if (axis.orientation == "top") {
          axis.dimensions = {
            x: contentDimensions.x, y: 0, width: contentDimensions.width, height: axis.size
          };
        } else if (axis.orientation == "right") {
          axis.dimensions = {
            x: native.clientWidth - axis.size, y: contentDimensions.y, width: axis.size, height: contentDimensions.height
          };
        }
      });

      this.marks.forEach(mark => {
        mark.dimensions = contentDimensions;
      });

      this.isLayouted = true;
    }

    this.updateData();
  }

  private updateData() {
    const fieldRegistry = new FieldRegistry();
    if (this.axis) {
      this.axis.forEach(axis => {
        axis.fieldSpecs = axis.fieldSpecs.map(spec => {
          if (axis.orientation == "bottom" || axis.orientation == "top") {
            return fieldRegistry.explicite(spec, this._data, [0, axis.dimensions.width]);
          } else {
            return fieldRegistry.explicite(spec, this._data, [axis.dimensions.height, 0]);
          }
        });
      });
    }
    if (this.marks) {
      this.marks.forEach(marks => {
        marks.fieldSpecs = marks.fieldSpecs.map(spec => {
          return fieldRegistry.explicite(spec, this._data);
        });
      });
    }

    if (this.marks) {
      this.marks.forEach(marks => {
        marks.render(this._data);
      });
    }
  }
}

export interface Layoutable {
  dimensions: LayoutDimensions;
}

export interface WithFieldSpecs {
  fieldSpecs: FieldSpec[];
}

export interface LayoutDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Mark extends Layoutable, WithFieldSpecs {
  render(data: Object[]): void;
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
