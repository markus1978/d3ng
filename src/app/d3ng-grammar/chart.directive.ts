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
          axis.updateDimensions({
            x: 0, y: contentDimensions.y, width: axis.size, height: contentDimensions.height
          });
        } else if (axis.orientation == "bottom") {
          axis.updateDimensions({
            x: contentDimensions.x, y: native.clientHeight - axis.size, width: contentDimensions.width, height: axis.size
          });
        } else if (axis.orientation == "top") {
          axis.updateDimensions({
            x: contentDimensions.x, y: 0, width: contentDimensions.width, height: axis.size
          });
        } else if (axis.orientation == "right") {
          axis.updateDimensions({
            x: native.clientWidth - axis.size, y: contentDimensions.y, width: axis.size, height: contentDimensions.height
          });
        }
      });

      this.marks.forEach(mark => {
        mark.updateDimensions(contentDimensions);
        mark.xScale = this.axis.find(axis => axis.field == mark.x).scale;
        mark.yScale = this.axis.find(axis => axis.field == mark.y).scale;
      });

      this.isLayouted = true;
    }

    this.updateData();
  }

  private updateData() {
    if (this.axis) {
      this.axis.forEach(axis => axis.data = this._data);
    }
    if (this.marks) {
      this.marks.forEach(marks => marks.data = this._data);
    }
  }
}

export interface Layoutable {
  updateDimensions(dimensions: LayoutDimensions);
}

export interface LayoutDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum FieldScaleTypes { quantitative, ordinal, nominal }
export interface FieldSpec {
  field: string;
  type: FieldScaleTypes;
  range: number[];
  domain: number[];
  aggregate: string;
  binning: string;

  scaleGenerator: (range: number[], domain: number[]) => (any) => number;
  scale: (any) => number;
  value: (object) => any;
}
