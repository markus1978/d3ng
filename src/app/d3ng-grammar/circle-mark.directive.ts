import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit, Component, Directive, ElementRef, EventEmitter, Host, HostListener, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from "@angular/core";
import * as d3 from "d3";
import {FieldDeclaration, FieldSpec, Layoutable, LayoutDimensions, Mark, WithFieldSpecs} from "./chart.directive";

@Directive({selector: '[d3ng-circle-mark]'})
export class CircleMarkDirective implements Mark {

  @Input() x: FieldSpec = null;
  @Input() y: FieldSpec = null;
  @Input() r: FieldSpec = null;

  private g: any = null;

  public render(value: object[]): void {
    this.g
      .selectAll("circle")
      .data(value)
      .enter()
      .append("circle")
      .attr("r", (this.r as FieldDeclaration).project)
      .attr("cx", (this.x as FieldDeclaration).project)
      .attr("cy", (this.y as FieldDeclaration).project);
  }

  set dimensions(value: LayoutDimensions) {
    this.g.attr("transform", `translate(${value.x}, ${value.y})`);
  }

  constructor(elRef: ElementRef) {
    this.g = d3.select(elRef.nativeElement);
  }

  get fieldSpecs(): FieldSpec[] {
    return [this.x, this.y, this.r];
  }

  set fieldSpecs(specs: FieldSpec[]) {
    this.x = specs[0];
    this.y = specs[1];
    this.r = specs[2];
  };
}

