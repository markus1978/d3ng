import {Directive, ElementRef, forwardRef, Input} from "@angular/core";
import * as d3 from "d3";
import {ChartElement, LayoutDimensions, LayoutOrientation} from "./chart-element";

@Directive({
  selector: '[d3ng-bar-mark]',
  providers: [{provide: ChartElement, useExisting: forwardRef(() => BarMarkDirective)}],
})
export class BarMarkDirective extends ChartElement {

  @Input() x: any = null;
  @Input() y: any = null;

  private g: any = null;
  private dimensions: LayoutDimensions = null;

  constructor(elRef: ElementRef) {
    super();
    this.g = d3.select(elRef.nativeElement);
  }

  registerVariables(registry) {
    this.x = registry(this.x);
    this.y = registry(this.y);
  }

  render(data) {
    let halfWidth = 0.5;
    if (this.x.binSize) {
      halfWidth = this.x.binSize * 0.5;
    }

    this.g
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", datum => this.x.scale(this.x.value(datum) - halfWidth))
      .attr("width", datum => {
        const value = this.x.value(datum);
        return this.x.scale(value + halfWidth) - this.x.scale(value - halfWidth);
      })
      .style("fill", "blue")
      .attr("y", datum => this.y.project(datum))
      .attr("height", datum => this.y.scale(this.y.domain[0]) - this.y.project(datum));
  }

  registerLayout(registry) {
    registry(LayoutOrientation.content);
  }

  layout(dimensions: LayoutDimensions) {
    this.dimensions = dimensions;
    this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.y})`);
  }
}

