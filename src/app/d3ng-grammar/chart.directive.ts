import {AfterViewInit, ContentChildren, Directive, ElementRef, forwardRef, Input, QueryList} from "@angular/core";
import * as d3 from "d3";
import {Variable, VariableRegistry} from "./variables";
import {D3ngChart, D3ngSelection} from "../../lib/d3ng-chart";
import {AbstractMarkDirective} from "./abstract-mark.directive";


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

@Directive({
  selector: '[d3ng-chart]',
  providers: [{provide: D3ngChart, useExisting: forwardRef(() => ChartDirective)}]
})
export class ChartDirective extends D3ngChart implements AfterViewInit {

  @ContentChildren(ChartElement) chartElements: QueryList<ChartElement>;

  private g: any = null;
  private layouts = new Map<ChartElement, { orientation: LayoutOrientation; size?: number; dimensions?: LayoutDimensions }>();

  private variables: VariableRegistry = new VariableRegistry();

  constructor(private elRef: ElementRef) {
    super();
    this.g = d3.select(elRef.nativeElement);
  }

  clear() {

  }

  draw() {
    if (this.data && this.data.length > 0) {
      this.chartElements.forEach(element => this.variables.check(element, this.layouts.get(element).dimensions, this.data));
      const data = this.variables.computeBinning(this.data);
      this.chartElements.forEach(element => element.render(data));
    }
  }

  protected drawSelection(selection: D3ngSelection): void {
    // listen to selection event in marks
    if (this.chartElements) {
      this.chartElements.forEach((mark: AbstractMarkDirective) => {
        if (mark.drawSelection) {
          mark.drawSelection(selection);
        }
      });
    }
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

    // listen to selection event in marks
    this.chartElements.forEach((mark: AbstractMarkDirective) => {
      if (mark.selectionChange) {
        mark.selectionChange.subscribe(selected => {
          this.setDirectSelection(selected);
        });
      }
    });
  }
}
