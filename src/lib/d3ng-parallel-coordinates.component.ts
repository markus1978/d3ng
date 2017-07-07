import {Component, forwardRef, Input, OnChanges, SimpleChanges, ViewChild} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";

interface Dimension {
  key: string;
  scale: number;
  direction: number;
}

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
  @Input() set dimensions(value: string[]) {
    this._dimensions = value.map(key => {
      return {
        key: key,
        scale: 1,
        direction: 1
      };
    });
  }

  private d3Chart = null;
  protected _dimensions: Dimension[] = [];

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
    this.data.forEach(datum => {
      this._dimensions.forEach(dim => {
        if (!datum[dim.key]) {
          datum[dim.key] = 0;
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
    if (!this.data || !this._dimensions) {
      return;
    }

    this.normalizeData();

    const m = [30, 30, 5, 30];
    const w = this.chart.nativeElement.offsetWidth - m[1] - m[3];
    const h = this.chart.nativeElement.offsetHeight - m[0] - m[2];

    const x = d3.scale.ordinal().domain(this._dimensions.map(dim => dim.key)).rangePoints([0, w]);
    const y = {};

    const line = d3.svg.line();
    const axis = d3.svg.axis().orient("left");

    // Add svg chart.
    this.d3Chart = d3.select(this.chart.nativeElement);
    const svg = this.d3Chart.append("svg:svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
      .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    let lines: any = null;

    // Create a scale and brush for each dimension.
    this._dimensions.forEach(dim => {
      this.data.forEach(datum => datum[dim.key] = +datum[dim.key]); // why? TODO

      // Calculate domain with 5% extra space
      const extent = d3.extent(this.data, datum => datum[dim.key]);

      // Create the scale
      y[dim.key] = this.getScaleForDimension(dim, extent)
        .range([h, 0]).nice();

      // Create the brush
      y[dim.key].brush = d3.svg.brush()
        .y(y[dim.key])
        .on("brush", () => {
          // Handles a brush event, toggling the display of forground lines.
          const actives = this._dimensions.filter(dim => !y[dim.key].brush.empty());
          const extents = actives.map(dim => y[dim.key].brush.extent());
          const selection = [];
          lines.each(datum => {
            const selected = actives.length != 0 && actives.every((dim, i) => extents[i][0] <= datum[dim.key] && datum[dim.key] <= extents[i][1]);
            if (selected) {
              selection.push(datum);
            }
          });
          this.setDirectSelection(selection);
        });
    });


    // Helper function: returns the path for a given data point.
    const expand = data => this._dimensions.filter(dim => data[dim.key] != 0).map(dim => {
      return {
        dim: dim.key,
        value: data[dim.key],
        data: data
      };
    });
    const path = data => line(expand(data).map(expanded => [x(expanded.dim), y[expanded.dim](expanded.value)]));
    const flatten = source => {
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
      .data(this.data)
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
      .data(this._dimensions)
      .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", d => "translate(" + x(d.key) + ")")
      .call(d3.behavior.drag()
        .origin(d => { return {x: x(d.key)}; })
        .on("dragstart", d => {
          i = this._dimensions.indexOf(d);
        })
        .on("drag", () => {
          x.range()[i] = d3.event.x;
          this._dimensions.sort((a, b) => x(a.key) - x(b.key));
          g.attr("transform", d => "translate(" + x(d.key) + ")");
          updateLines(lines);
          updateDots(dots);
        })
        .on("dragend", () => {
          x.domain(this._dimensions.map(dim => dim.key)).rangePoints([0, w]);
          const t = d3.transition().duration(500);
          t.selectAll(".dimension").attr("transform", dim => "translate(" + x(dim.key) + ")");
          updateLines(t.selectAll(".foreground path"));
          updateDots(t.selectAll(".foreground circle"));
        }));

    // Add an axis and title.
    const axisSvg = g.append("svg:g");
    axisSvg
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d.key]).ticks(10, "s")); })
      .append("svg:text").classed("axisTitle", true)
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(d => this.getDimensionLabel(d.key));
    this.appendAxis(axisSvg);

    // Add a brush for each axis.
    g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(y[d.key].brush); })
      .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
  }

  public appendAxis(axis: any): void {
    axis.selectAll('.axisTitle').attr("y", -15); // move the title out of the way
    this.appendScaleArrowsToAxis(axis);
    this.appendDirectionButtonToAxis(axis);
  }

  protected appendDirectionButtonToAxis(axis): void {
    axis.append('svg:text')
      .text("^")
      .attr("text-anchor", "middle")
      .attr("y", -2)
      .attr("x", 13)
      .attr("style", "font-size: 11px; cursor: pointer;")
      .on("click", (dim) => {
        if (!dim.direction) {
          dim.direction = 1;
        }
        dim.direction = dim.direction * -1;
        this.redraw();
      });
  }

  protected appendScaleArrowsToAxis(axis): void {
    const addScaleArrow = (direction) => {
      axis.append('svg:text')
        .text(direction > 0 ? '>' : '<')
        .attr("text-anchor", "middle")
        .attr("y", -4)
        .attr("x", 5 * direction)
        .attr("style", "font-size: 11px; cursor: pointer;")
        .on('click', (dim) => {
          if (!dim.scale) {
            dim.scale = 1;
          }
          dim.scale = direction > 0 ? dim.scale * 1.2 : dim.scale / 1.2;
          this.redraw();
        });
    };
    addScaleArrow(1);
    addScaleArrow(-1);
  }

  public getScaleForDimension(dim: Dimension, domain: number[]): any {
    let extent = domain;
    if (dim.direction < 0) {
      extent = [extent[1], extent[0]];
    }
    return d3.scale.pow().exponent(dim.scale).domain(extent);
  }

}
