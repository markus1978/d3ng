import {
  Component, Input, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart} from "./d3ng-chart";

@Component({
  selector: 'd3ng-scatter-plot',
  template: `
    <div #chart></div>`,
  styles: [
    ':host { height: 100%;}',
    ':host /deep/ .selected { fill: blue; }',
    ':host /deep/ .extent { fill-opacity: 0.2; }',
    ':host /deep/ .axis path, :host /deep/ .axis line { fill: none; stroke: #000; shape-rendering: crispEdges; }'
  ]
})

export class D3ngScatterPlotComponent extends D3ngChart implements OnChanges {

  @ViewChild('chart') chart;

  @Input() protected x: string;
  @Input() protected y: string;

  private d3Chart = null;

  protected drawSelected(selected:Array<any>) {
    if (this.d3Chart) {
      this.d3Chart.selectAll("circle").classed("selected", function(d) {
        return selected.indexOf(d) != -1;
      });
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
    if (!this.data ||!this.x ||!this.y) {
      return;
    }
    const self = this;

    self.normalizeData();
    const margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = this.chart.nativeElement.offsetWidth  - margin.left - margin.right,
      height = 300  - margin.top - margin.bottom; // this.chart.nativeElement.offsetHeight

    const scales: any = {};
    scales.x = d3.scale.linear().range([0, width]);
    scales.y = d3.scale.linear().range([height, 0]);

    const xAxis = d3.svg.axis().scale(scales.x).orient("bottom");
    const yAxis = d3.svg.axis().scale(scales.y).orient("left");

    const d_chart = d3.select(self.chart.nativeElement);
    const svg = d_chart.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    this.d3Chart = svg;

    ["x", "y"].forEach(function(dim) {
      const extent = d3.extent(self.data, d => d[self[dim]]);
      const size = extent[1] - extent[0];
      extent[0] = extent[0] - size*.05;
      extent[1] = extent[1] + size*.05;
      scales[dim].domain(extent).nice();
    });


    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(self.x);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(self.y);

    svg.selectAll(".dot")
      .data(self.data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return scales.x(d[self.x]); })
      .attr("cy", function(d) { return scales.y(d[self.y]); })
      .append("title").text(function(d) {
        return self.getQualifiedLabel(d);
      });

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
        self.selected = selection;
        self.selectedChange.emit(self.selected);
      });
    svg.append("g").call(brush);

  }

}
