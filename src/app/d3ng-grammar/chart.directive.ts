import {AfterViewInit, ContentChildren, Directive, ElementRef, Input, QueryList} from "@angular/core";
import * as d3 from "d3";
import {ChartElement, FieldRegistry, FieldSpec, LayoutDimensions, LayoutOrientation} from "./chart-element";

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

  constructor(private elRef: ElementRef) {
    this.g = d3.select(elRef.nativeElement);
  }

  ngAfterViewInit() {
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
    if (!this.dirty) {
      // register/update all fields
      const fieldRegistry = new FieldRegistry();
      this.chartElements.forEach(element => {
        const layout = this.layouts.get(element);
        element.registerVariables((fieldSpec: FieldSpec) => {
          let extent: number[];
          if (layout.orientation === LayoutOrientation.bottom || layout.orientation === LayoutOrientation.top) {
            extent = [0, layout.dimensions.width];
          } else if (layout.orientation === LayoutOrientation.left || layout.orientation === LayoutOrientation.right) {
            extent = [layout.dimensions.height, 0];
          }
          return fieldRegistry.explicite(fieldSpec, this._data, extent);
        });
      });

      // render
      this.chartElements.forEach(element => element.render(this._data));
    }
  }
}
