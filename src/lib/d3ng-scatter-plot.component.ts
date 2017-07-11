import {Component, forwardRef, Input, OnChanges, ViewChild} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";

@Component({
  selector: 'd3ng-scatter-plot',
  providers: [{provide: D3ngChart, useExisting: forwardRef(() => D3ngScatterPlotComponent)}],
  template: `
    <div #xSelect class="y-controls">
      <md-select [(ngModel)]="y" (change)="onYChange($event)">
        <md-option *ngFor="let dim of dimensions ? dimensions : [y]" [value]="dim">{{ dim }}</md-option>
      </md-select>
    </div>
    <div #ySelect class="x-controls">
      <md-select [(ngModel)]="x" (change)="onXChange($event)">
        <md-option *ngFor="let dim of dimensions ? dimensions : [x]" [value]="dim">{{ dim }}</md-option>
      </md-select>
    </div>
    <div #chart class="content"></div>`,
  styleUrls: [ './d3ng-scatter-plot.component.css' ]
})

export class D3ngScatterPlotComponent extends D3ngChart {

  @ViewChild('chart') chart;
  @ViewChild('xSelect') xSelect;
  @ViewChild('ySelect') ySelect;

  @Input() x: string;
  @Input() y: string;

  @Input() dimensions: Array<string>;

  private d3Chart = null;

  @Input() config: {
    extent?: number[][],
    ticks?: number[]
  } = {};

  onXChange(event: any): void {
    this.x = event.value;
    this.redraw();
  }

  onYChange(event: any): void {
    this.y = event.value;
    this.redraw();
  }

  protected drawSelection(selection: D3ngSelection): void {
    if (this.d3Chart) {
      this.d3Chart.selectAll("circle").style("fill", dataPoint => selection.selectionColor(dataPoint));
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  /**
   * Fill all `dimension`s in all data objects with value 0, if no
   * value exists.
   */
  protected normalizeData() {
    const self = this;
    this.data.forEach(function(d) {
      [self.x, self.y].forEach(function(dim) {
        if (!d[dim]) {
          d[dim] = 0;
        }
      });
    });
  }

  protected draw() {
    if (!this.data) {
      return;
    }
    if (!this.x || !this.y) {
      if (!this.dimensions || this.dimensions.length <= 1) {
        return;
      }
      this.x = this.dimensions[0];
      this.y = this.dimensions[1];
    }

    const self = this;

    self.normalizeData();
    const margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = this.chart.nativeElement.offsetWidth  - margin.left - margin.right,
      height = this.chart.nativeElement.offsetHeight  - margin.top - margin.bottom;

    const scales: any = {};
    scales.x = d3.scale.linear().range([0, width]);
    scales.y = d3.scale.linear().range([height, 0]);

    const xAxis = d3.svg.axis().scale(scales.x).orient("bottom");
    const yAxis = d3.svg.axis().scale(scales.y).orient("left");
    if (this.config.ticks) {
      xAxis.ticks(this.config.ticks[0], "s");
      yAxis.ticks(this.config.ticks[1], "s");
    }

    const d_chart = d3.select(self.chart.nativeElement);
    const svg = d_chart.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    this.d3Chart = svg;

    if (this.config.extent) {
      scales['x'].domain(this.config.extent[0]).nice();
      scales['y'].domain(this.config.extent[1]).nice();
    } else {
      ["x", "y"].forEach(function (dim) {
        const extent = d3.extent(self.data, d => d[self[dim]]);
        const size = extent[1] - extent[0];
        extent[0] = extent[0] - size * .05;
        extent[1] = extent[1] + size * .05;
        scales[dim].domain(extent).nice();
      });
    }

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    const brush = d3.svg.brush()
      .x(scales.x).y(scales.y)
      .on("brush", () => {
        const e = brush.extent();
        const selection = [];
        self.data.forEach(d => {
          if (!(e[0][0] > d[self.x] || d[self.x] > e[1][0] || e[0][1] > d[self.y] || d[self.y] > e[1][1])) {
            selection.push(d);
          }
        });
        self.setDirectSelection(selection);
      });
    svg.append("g").call(brush);

    const dots = svg.selectAll(".dot")
      .data(self.data)
      .enter().append("circle");
    dots.attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return scales.x(d[self.x]); })
      .attr("cy", function(d) { return scales.y(d[self.y]); });

    this.appendTooltip(dots);
  }

}
