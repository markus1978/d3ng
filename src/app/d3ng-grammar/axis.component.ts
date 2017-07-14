import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output,
  SimpleChanges
} from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: '[d3ng-axis]',
  template: `
    
  `
})
export class AxisComponent {

  @Input() dimension: string = null;
  @Input() field: string = null;
  @Input() type: string = null;

  private _data: object[] = null;
  public set data(value: object[]) {
    this._data = value;

    const extent = d3.extent(this._data.map(datum => datum[this.field]));

    let scale, axis;
    if (this.dimension == "x") {
      scale = d3.scale.linear().range([0, 150]).domain(extent);
      axis = d3.svg.axis().scale(scale).orient("bottom");
    } else if (this.dimension == "y") {
      scale = d3.scale.linear().range([100, 0]).domain(extent);
      axis = d3.svg.axis().scale(scale).orient("left");
    } else {
      throw new Error("Bad dimension " + this.dimension);
    }

    d3.select(this.elRef.nativeElement).call(axis);
  }

  constructor(private elRef: ElementRef) {
  }
}

