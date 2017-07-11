import {Component, forwardRef, Input, ViewChild} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";

export interface Point {
  x: number;
  y: number;
  label: string;
}
export type Path = Point[];

@Component({
  selector: 'd3ng-path-plot',
  providers: [{provide: D3ngChart, useExisting: forwardRef(() => D3ngPathPlotComponent)}],
  template: `
    <div #xSelect *ngIf="dimensions" class="y-controls">
      <md-select [(ngModel)]="y" (change)="onYChange($event)">
        <md-option *ngFor="let dim of dimensions ? dimensions : [y]" [value]="dim">{{ dim }}</md-option>
      </md-select>
    </div>
    <div #ySelect *ngIf="dimensions" class="x-controls">
      <md-select [(ngModel)]="x" (change)="onXChange($event)">
        <md-option *ngFor="let dim of dimensions ? dimensions : [x]" [value]="dim">{{ dim }}</md-option>
      </md-select>
    </div>
    <div #chart class="content"></div>`,
  styleUrls: [ './d3ng-path-plot.component.css' ]
})
export class D3ngPathPlotComponent extends D3ngChart {

  @ViewChild('chart') chart;

  /**
   * Returns the path for a given data point. Clients must implement this method, d3ng does not
   * compute paths on its own!
   */
  @Input() path: (datum: any, xdim?: any, ydim?: any) => Path = null;
  @Input() dimensions: any[] = null;
  @Input() config: {
    ticks: number[];
    extent: number[][];
  } = null;

  private d3Chart = null;

  x: any = null;
  y: any = null;

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
      this.d3Chart.selectAll(".path-group").each(function(datum) {
        const color = selection.selectionColor(datum.source);
        const svg = d3.select(this);
        svg.classed("selected", color != "black");
        svg.selectAll("path").style("stroke", color);
        svg.selectAll("circle").style("fill", color);
      });
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  protected draw() {
    if (!this.data) {
      return;
    }

    if (!this.path) {
      throw new Error("The path property is mandatory.");
    }

    if (!this.x || !this.y) {
      if (!this.dimensions || this.dimensions.length <= 1) {
        return;
      }
      this.x = this.dimensions[0];
      this.y = this.dimensions[1];
    }

    // compute paths and extent
    let extent: number[][];
    const paths = this.data.map(datum => {
      return {
        path: this.path(datum, this.x, this.y),
        source: datum
      };
    });
    if (this.config && this.config.extent) {
      extent = this.config.extent;
    } else {
      extent = [[Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER], [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]];
      paths.forEach(path => path.path.forEach(point => {
        extent[0][1] = Math.max(extent[0][1], point.x);
        extent[0][0] = Math.min(extent[0][0], point.x);
        extent[1][1] = Math.max(extent[1][1], point.y);
        extent[1][0] = Math.min(extent[1][0], point.y);
      }));
      extent.forEach(extent => {
        const size = extent[1] - extent[0];
        extent[0] = extent[0] - size * .05;
        extent[1] = extent[1] + size * .05;
      });
    }

    const margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = this.chart.nativeElement.offsetWidth  - margin.left - margin.right,
      height = this.chart.nativeElement.offsetHeight  - margin.top - margin.bottom;

    const scales: any = {};
    scales.x = d3.scale.linear().range([0, width]);
    scales.y = d3.scale.linear().range([height, 0]);

    const xAxis = d3.svg.axis().scale(scales.x).orient("bottom");
    const yAxis = d3.svg.axis().scale(scales.y).orient("left");
    if (this.config && this.config.ticks) {
      xAxis.ticks(this.config.ticks[0], "s");
      yAxis.ticks(this.config.ticks[1], "s");
    }

    const d_chart = d3.select(this.chart.nativeElement);
    const svg = d_chart.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    this.d3Chart = svg;

    scales['x'].domain(extent[0]).nice();
    scales['y'].domain(extent[1]).nice();

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
        paths.forEach(path => path.path.forEach(point => {
          if (!(e[0][0] > point.x || point.x > e[1][0] || e[0][1] > point.y || point.y > e[1][1])) {
            selection.push(path.source);
          }
        }));
        this.setDirectSelection(selection);
      });
    svg.append("g").call(brush);

    const line = d3.svg.line();
    const svgPathGroups = svg.selectAll(".path-group")
      .data(paths)
      .enter().append("g").attr("class", "path-group");

    const svgPaths = svgPathGroups.append("path")
      .attr("class", "path")
      .attr("d", path => line(path.path.map(point => [scales.x(point.x), scales.y(point.y)])));

    const svgDots = svgPathGroups.selectAll(".dot")
      .data(path => path.path)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", point => scales.x(point.x))
      .attr("cy", point => scales.y(point.y));

    this.appendTooltip(svgPaths, path => `${path.source.label} (${path.path[0].label}-${path.path[path.path.length - 1].label})`);
    this.appendTooltip(svgDots, point => point.label);
  }

}
