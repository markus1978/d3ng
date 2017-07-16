import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit, Component, Directive, ElementRef, EventEmitter, Host, HostListener, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from "@angular/core";
import * as d3 from "d3";
import {Layoutable, LayoutDimensions} from "./chart.directive";

@Directive({selector: '[d3ng-axis]'})
export class AxisDirective implements OnInit, Layoutable {

  @Input() orientation: string = null;
  @Input() field: string = null;
  @Input() type: string = null;
  @Input() size = 33;

  private g: any = null;
  public scale: any = null;
  private axis: any = null;

  public set data(value: object[]) {
    const extent = d3.extent(value.map(datum => datum[this.field]));
    const range = extent[1] - extent[0];
    this.scale.domain([extent[0] - range * 0.1, extent[1] + range * 0.1]);
    this.g.call(this.axis);
  }

  constructor(elRef: ElementRef) {
    this.g = d3.select(elRef.nativeElement);
  }

  ngOnInit(): void {
    this.scale = d3.scale.linear();
    this.axis = d3.svg.axis().scale(this.scale).orient(this.orientation);

    this.g.classed("axis", true);
  }

  updateDimensions(dimensions: LayoutDimensions) {
    if (this.orientation == "bottom" || this.orientation == "top") {
      this.scale.range([0, dimensions.width]);
    } else if (this.orientation == "left" || this.orientation == "right") {
      this.scale.range([dimensions.height, 0]);
    }

    if (this.orientation == "left") {
      this.g.attr("transform", `translate(${dimensions.width},${dimensions.y})`);
    } else if (this.orientation == "right") {
      this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.y})`);
    } else if (this.orientation == "bottom") {
      this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.y})`);
    } else if (this.orientation == "top") {
      this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.height})`);
    }

    this.g.call(this.axis);
  }
}

