import {AfterViewInit, ContentChildren, Directive, ElementRef, Input, QueryList} from "@angular/core";
import * as d3 from "d3";
import {Variable, VariableRegistry} from "./variables";


export abstract class ChartElement {
  abstract registerLayout(registry: (orientation: LayoutOrientation, size: number) => any): void;
  abstract layout(dimensions: LayoutDimensions): void;

  abstract registerVariables(registry: (spec: any) => Variable);
  abstract render(data: Object[]);
}

export enum LayoutOrientation { top, bottom, left, right, content, chart }

export interface LayoutDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Directive({ selector: '[d3ng-chart]' })
export class ChartDirective implements AfterViewInit {

  @ContentChildren(ChartElement) chartElements: QueryList<ChartElement>;

  private _data: object[] = null;
  @Input() set data(value: object[]) {
    this._data = value;
    this.updateData();
  }

  private dirty = true;
  private g: any = null;
  private layouts = new Map<ChartElement, { orientation: LayoutOrientation; size?: number; dimensions?: LayoutDimensions }>();

  private variables: VariableRegistry = new VariableRegistry();

  constructor(private elRef: ElementRef) {
    this.g = d3.select(elRef.nativeElement);
  }

  ngAfterViewInit() {
    // register variables
    this.chartElements.forEach(element => element.registerVariables(spec => this.variables.register(spec, element)));

    // layout
    const native = this.elRef.nativeElement;
    const chartDimensions = {
      x: 0, y: 0, width: native.clientWidth, height: native.clientHeight
    };
    const contentDimensions = {
      x: 0, y: 0, width: native.clientWidth, height: native.clientHeight
    };

    // register all layout information
    this.chartElements.forEach(element => {
      element.registerLayout((orientation: LayoutOrientation, size?: number) => {
        this.layouts.set(element, { orientation: orientation, size: size });
        if (orientation === LayoutOrientation.left) {
          contentDimensions.x += size;
          contentDimensions.width -= size;
        } else if (orientation === LayoutOrientation.bottom) {
          contentDimensions.height -= size;
        } else if (orientation === LayoutOrientation.right) {
          contentDimensions.width -= size;
        } else if (orientation === LayoutOrientation.top) {
          contentDimensions.y += size;
          contentDimensions.height -= size;
        }
      });
    });

    // distribute calculated dimensions based on layout(s)
    this.chartElements.forEach(element => {
      const layout = this.layouts.get(element);
      if (layout.orientation === LayoutOrientation.left) {
        layout.dimensions = {
          x: 0, y: contentDimensions.y, width: layout.size, height: contentDimensions.height
        };
      } else if (layout.orientation === LayoutOrientation.bottom) {
        layout.dimensions = {
          x: contentDimensions.x, y: native.clientHeight - layout.size, width: contentDimensions.width, height: layout.size
        };
      } else if (layout.orientation === LayoutOrientation.top) {
        layout.dimensions = {
          x: contentDimensions.x, y: 0, width: contentDimensions.width, height: layout.size
        };
      } else if (layout.orientation === LayoutOrientation.right) {
        layout.dimensions = {
          x: native.clientWidth - layout.size, y: contentDimensions.y, width: layout.size, height: contentDimensions.height
        };
      } else if (layout.orientation === LayoutOrientation.content) {
        layout.dimensions = contentDimensions;
      } else if (layout.orientation === LayoutOrientation.chart) {
        layout.dimensions = chartDimensions;
      }
      element.layout(layout.dimensions);
    });

    this.dirty = false;

    if (this._data) {
      this.updateData();
    }
  }

  private updateData() {
    if (!this.dirty && this._data && this._data.length > 0) {
      this.chartElements.forEach(element => this.variables.check(element, this.layouts.get(element).dimensions, this._data));
      const data = this.variables.computeBinning(this._data);
      this.chartElements.forEach(element => element.render(data));
    }
  }
}
