import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit, Component, Directive, ElementRef, EventEmitter, Host, HostListener, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from "@angular/core";
import * as d3 from "d3";
import {Layoutable, LayoutDimensions} from "./chart.directive";

@Directive({selector: '[d3ng-circle-mark]'})
export class CircleMarkDirective implements Layoutable {

  @Input() x: string = null;
  @Input() y: string = null;
  @Input() r: any = null;

  private g: any = null;
  public xScale: any = null;
  public yScale: any = null;
  public rScale: any = null;

  public set data(value: object[]) {
    if (this.rScale == null) {
      this.rScale = d3.scale.linear();
      if (this.r instanceof Object && this.r['range']) {
        this.rScale.range(this.r.range);
      }
      this.rScale.domain(d3.extent(value.map(datum => datum[this.r.field])));
    }

    this.g
      .selectAll("circle")
      .data(value)
      .enter()
      .append("circle")
      .attr("r", d => this.rScale(d[this.r.field]))
      .attr("cx", d => this.xScale(d[this.x]))
      .attr("cy", d => this.yScale(d[this.y]));
  }

  updateDimensions(dimensions: LayoutDimensions) {
    this.g.attr("transform", `translate(${dimensions.x}, ${dimensions.y})`);
  }

  constructor(elRef: ElementRef) {
    this.g = d3.select(elRef.nativeElement);
  }
}

