import {Component, forwardRef, Input, OnChanges, SimpleChanges, ViewChild} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";

@Component({
  selector: 'd3ng-parallel-coordinates',
  providers: [{provide: D3ngChart, useExisting: forwardRef(() => D3ngParallelCoordinatesComponent)}],
  template: `
    <div #chart class="content"></div>
  `,
  styleUrls: [ './d3ng-parallel-coordinates.component.css' ]
})

export class D3ngParallelCoordinatesComponent extends D3ngChart implements OnChanges {

  @ViewChild('chart') chart;

  /**
   * An array of strings that provides the axis. These have to
   * the keys for the data objects.
   */
  @Input() protected dimensions: Array<string>;

  private d3Chart = null;

  protected drawSelection(selection: D3ngSelection): void {
    if (this.d3Chart) {
      const foreground = this.d3Chart.selectAll(".foreground");
      foreground.selectAll("path")
        .style("stroke", dataPoint => selection.selectionColor(dataPoint))
        .classed("selected", dataPoint => selection.isSelected(dataPoint));
      foreground.selectAll("circle")
        .style("fill", expanded => selection.selectionColor(expanded.data))
        .classed("selected", expanded => selection.isSelected(expanded.data));
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
      self.dimensions.forEach(function(dim) {
        if (!d[dim]) {
          d[dim] = 0;
        }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty("dimensions")) {
      this.redraw();
    } else {
      super.ngOnChanges(changes);
    }
  }

  protected draw() {
    if (!this.data || !this.dimensions) {
      return;
    }
    const self = this;

    self.normalizeData();

    const m = [30, 30, 5, 30];
    const w = this.chart.nativeElement.offsetWidth - m[1] - m[3];
    const h = this.chart.nativeElement.offsetHeight - m[0] - m[2];

    const x = d3.scale.ordinal().domain(self.dimensions).rangePoints([0, w]);
    const y = {};

    const line = d3.svg.line();
    const axis = d3.svg.axis().orient("left");

    // Add svg chart.
    this.d3Chart = d3.select(self.chart.nativeElement);
    const svg = this.d3Chart.append("svg:svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
      .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    let lines: any = null;

    // Create a scale and brush for each dimension.
    self.dimensions.forEach(d => {
      self.data.forEach(p => { p[d] = +p[d]; });

      // Calculate domain with 5% extra space
      const extent = d3.extent(self.data, p => p[d]);

      // Create the scale
      y[d] = this.getScaleForDimension(d)
        .domain(extent)
        .range([h, 0]).nice();

      // Create the brush
      y[d].brush = d3.svg.brush()
        .y(y[d])
        .on("brush", () => {
          // Handles a brush event, toggling the display of forground lines.
          const actives = self.dimensions.filter(p => !y[p].brush.empty());
          const extents = actives.map(p => y[p].brush.extent());
          const selection = [];
          lines.each(d => {
            const selected = actives.length != 0 && actives.every((p, i) => extents[i][0] <= d[p] && d[p] <= extents[i][1]);
            if (selected) {
              selection.push(d);
            }
          });
          self.setDirectSelection(selection);
        });
    });


    // Helper function: returns the path for a given data point.
    const expand = data => self.dimensions.filter(dim => data[dim] != 0).map(dim => {
      return {
        dim: dim,
        value: data[dim],
        data: data
      };
    });
    const path = data => line(expand(data).map(expanded => [x(expanded.dim), y[expanded.dim](expanded.value)]));
    const flatten = function<T>(source: Array<Array<T>>): Array<T> {
      const result = [];
      source.forEach(d => d.forEach(d => result.push(d)));
      return result;
    };
    // Add foreground
    const foreground = svg.append("svg:g")
      .attr("class", "foreground");
    // Add lines
    const updateLines = lines => lines.attr("d", path);
    lines = foreground.selectAll("path")
      .data(self.data)
      .enter().append("svg:path");
    updateLines(lines);

    // Add dots
    const updateDots = dots => dots
      .attr("cx", expanded => x(expanded.dim))
      .attr("cy", expanded => y[expanded.dim](expanded.value));
    const dots = foreground.selectAll("circle")
      .data(flatten(this.data.map(expand)))
      .enter().append("svg:circle")
      .attr("r", 4);
    updateDots(dots);

    this.appendTooltip(lines);

    let i = 0;

    // Add a group element for each dimension.
    const g = svg.selectAll(".dimension")
      .data(self.dimensions)
      .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", d => "translate(" + x(d) + ")")
      .call(d3.behavior.drag()
        .origin(d => { return {x: x(d)}; })
        .on("dragstart", d => {
          i = self.dimensions.indexOf(d);
        })
        .on("drag", () => {
          x.range()[i] = d3.event.x;
          self.dimensions.sort((a, b) => x(a) - x(b));
          g.attr("transform", d => "translate(" + x(d) + ")");
          updateLines(lines);
          updateDots(dots);
        })
        .on("dragend", () => {
          x.domain(self.dimensions).rangePoints([0, w]);
          const t = d3.transition().duration(500);
          t.selectAll(".dimension").attr("transform", d => "translate(" + x(d) + ")");
          updateLines(t.selectAll(".foreground path"));
          updateDots(t.selectAll(".foreground circle"));
        }));

    // Add an axis and title.
    const axisSvg = g.append("svg:g");
    axisSvg
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d]).ticks(10, "s")); })
      .append("svg:text").classed("axisTitle", true)
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(d => this.getDimensionLabel(d));
    this.appendAxis(axisSvg);

    // Add a brush for each axis.
    g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(y[d].brush); })
      .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
  }

  public appendAxis(axis: any): void {

  }

  public getScaleForDimension(dim: any): any {
    return d3.scale.linear();
  }

}
