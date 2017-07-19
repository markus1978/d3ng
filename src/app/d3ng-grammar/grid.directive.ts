import {Directive, ElementRef, forwardRef, Input} from "@angular/core";
import * as d3 from "d3";
import {ChartElement, LayoutDimensions, LayoutOrientation} from "./chart-element";

@Directive({
  selector: '[d3ng-grid]',
  providers: [{provide: ChartElement, useExisting: forwardRef(() => GridDirective)}],
})
export class GridDirective extends ChartElement {

  @Input() x: any;
  @Input() y: any;

  private g: any = null;
  private dimensions: LayoutDimensions;

  constructor(elRef: ElementRef) {
    super();
    this.g = d3.select(elRef.nativeElement);
    this.g.classed("grid", true);
  }

  registerLayout(registry) {
    registry(LayoutOrientation.content);
  }

  layout(dimensions) {
    this.dimensions = dimensions;
    this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.y})`);
  }

  registerVariables(registry) {
    if (this.x) {
      this.x = registry(this.x);
    }
    if (this.y) {
      this.y = registry(this.y);
    }
  }

  render(data) {
    let xTicks, yTicks;
    if (this.x) {
      xTicks = this.x.scale.ticks();
      this.g.selectAll("line.x")
        .data(xTicks).enter()
        .append("line")
        .attr("class", "x")
        .attr("x1", tick => this.x.scale(tick))
        .attr("x2", tick => this.x.scale(tick))
        .attr("y1", 0)
        .attr("y2", this.dimensions.height);
    }
    if (this.y) {
      yTicks = this.y.scale.ticks();
      this.g.selectAll("line.y")
        .data(yTicks).enter()
        .append("line")
        .attr("class", "y")
        .attr("y1", tick => this.y.scale(tick))
        .attr("y2", tick => this.y.scale(tick))
        .attr("x1", 0)
        .attr("x2", this.dimensions.width);
    }
  }
}

