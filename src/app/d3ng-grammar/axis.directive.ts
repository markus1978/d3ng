import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit, Component, Directive, ElementRef, EventEmitter, Host, HostListener, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from "@angular/core";
import * as d3 from "d3";
import {FieldDeclaration, FieldSpec, Layoutable, LayoutDimensions, WithFieldSpecs} from "./chart.directive";

@Directive({selector: '[d3ng-axis]'})
export class AxisDirective implements OnInit, Layoutable, WithFieldSpecs {

  @Input() orientation: string = null;
  @Input() field: FieldSpec = null;
  @Input() type: string = null;
  @Input() size = 33;

  private _dimensions: LayoutDimensions = null;
  private g: any = null;

  constructor(elRef: ElementRef) {
    this.g = d3.select(elRef.nativeElement);
  }

  ngOnInit(): void {
    this.g.classed("axis", true);
  }

  set dimensions(dimensions: LayoutDimensions) {
    this._dimensions = dimensions;

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
  get dimensions(): LayoutDimensions {
    return this._dimensions;
  }

  get fieldSpecs(): FieldSpec[] {
   return [this.field];
  }

  set fieldSpecs(specs: FieldSpec[]) {
    this.field = specs[0];

    const axis = d3.svg.axis().scale((this.field as FieldDeclaration).scale).orient(this.orientation);
    this.g.call(axis);
  };
}

