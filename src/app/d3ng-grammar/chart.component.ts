import {
  AfterContentInit,
  AfterViewInit, Component, ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, HostListener, Input,
  OnChanges, OnInit,
  Output,
  QueryList,
  SimpleChanges, ViewChild
} from "@angular/core";
import * as d3 from "d3";
import {AxisComponent} from "./axis.component";


@Component({
  selector: 'd3ng-chart',
  template: `
    <svg:svg #svg>
      <g>
        <ng-content></ng-content>
      </g>
    </svg:svg>`,
  styles: [ ]
})
export class ChartComponent implements AfterContentInit {

  @ContentChildren(AxisComponent) axis: QueryList<AxisComponent>;
  @ViewChild('svg') svg: ElementRef;

  private _data: object[] = null;
  @Input() set data(value: object[]) {
    this._data = value;
  }

  constructor(private elRef: ElementRef) { }

  ngAfterContentInit() {
    this.updateData();

    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = this.elRef.nativeElement.offsetWidth  - margin.left - margin.right;
    const height = this.elRef.nativeElement.offsetHeight  - margin.top - margin.bottom;

    const svg = d3.select(this.svg.nativeElement);
    svg.attr("width", width).attr("height", height).select("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  private updateData() {
    if (this.axis) {
      this.axis.forEach(axis => axis.data = this._data);
    }
  }
}

