import {Directive, ElementRef, forwardRef, Input} from "@angular/core";
import * as d3 from "d3";
import {ChartElement, LayoutDimensions, LayoutOrientation} from "./chart-element";

@Directive({
  selector: '[d3ng-axis]',
  providers: [{provide: ChartElement, useExisting: forwardRef(() => AxisDirective)}],
})
export class AxisDirective extends ChartElement {

  @Input() orientation: string = null;
  @Input() field = null;
  @Input() type: string = null;
  @Input() size = 33;
  @Input() grid = false;

  private g: any = null;
  private dimensions: LayoutDimensions;

  constructor(elRef: ElementRef) {
    super();
    this.g = d3.select(elRef.nativeElement);
    this.g.classed("axis", true);
  }

  registerLayout(registry) {
    registry(LayoutOrientation[this.orientation], this.size);
  }

  layout(dimensions) {
    this.dimensions = dimensions;
    if (this.orientation == "left") {
      this.g.attr("transform", `translate(${dimensions.width},${dimensions.y})`);
    } else if (this.orientation == "right") {
      this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.y})`);
    } else if (this.orientation == "bottom") {
      this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.y})`);
    } else if (this.orientation == "top") {
      this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.height})`);
    }
  }

  registerVariables(registry) {
    this.field = registry(this.field);
  }

  render(data) {
    const axis = d3.svg.axis().scale(this.field.scale).orient(this.orientation);
    if (this.grid) {
      if (this.orientation == "top" || this.orientation == "bottom") {
        axis.innerTickSize(-this.dimensions.height);
      } else {
        axis.innerTickSize(-this.dimensions.width);
      }
    }
    this.g.call(axis);
  }
}

