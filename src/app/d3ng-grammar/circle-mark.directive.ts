import {Directive, ElementRef, forwardRef, Input} from "@angular/core";
import * as d3 from "d3";
import {ChartElement, FieldDeclaration, FieldSpec, LayoutDimensions, LayoutOrientation} from "./chart-element";

@Directive({
  selector: '[d3ng-circle-mark]',
  providers: [{provide: ChartElement, useExisting: forwardRef(() => CircleMarkDirective)}],
})
export class CircleMarkDirective extends ChartElement {

  @Input() x: FieldSpec = null;
  @Input() y: FieldSpec = null;
  @Input() r: FieldSpec = null;

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
    this.g
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", (this.r as FieldDeclaration).project)
      .attr("cx", (this.x as FieldDeclaration).project)
      .attr("cy", (this.y as FieldDeclaration).project);
  }

  registerLayout(registry) {
    registry(LayoutOrientation.content);
  }

  layout(dimensions: LayoutDimensions) {
    this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.y})`);
  }
}

