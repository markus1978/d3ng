import {Directive, ElementRef, forwardRef, Input} from "@angular/core";
import * as d3 from "d3";
import {ChartElement, LayoutDimensions, LayoutOrientation} from "./chart.directive";

@Directive({
  selector: '[d3ng-circle-mark]',
  providers: [{provide: ChartElement, useExisting: forwardRef(() => CircleMarkDirective)}],
})
export class CircleMarkDirective extends ChartElement {

  @Input() x = null;
  @Input() y = null;
  @Input() r: any = { project: datum => 3 };

  private g: any = null;

  constructor(elRef: ElementRef) {
    super();
    this.g = d3.select(elRef.nativeElement);
  }

  registerVariables(registry) {
    this.x = registry(this.x);
    this.y = registry(this.y);
    this.r = registry(this.r);
  }

  render(data) {
    const self = this;
    this.g
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", datum => this.r.project(datum))
      .attr("cx", datum => this.x.project(datum))
      .attr("cy", datum => this.y.project(datum));
  }

  registerLayout(registry) {
    registry(LayoutOrientation.content);
  }

  layout(dimensions: LayoutDimensions) {
    this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.y})`);
  }
}

