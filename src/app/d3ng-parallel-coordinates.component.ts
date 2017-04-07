import {
  Component, Input, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart} from "./d3ng-chart";

@Component({
  selector: 'd3ng-parallel-coordinates',
  template: `
    <div #chart></div>`,
  styleUrls: [ './d3ng-parallel-coordinates.component.css' ]
})

export class D3ngParallelCoordinatesComponent extends D3ngChart implements OnChanges {

  @ViewChild('chart') chart;

  /**
   * An array of strings that provides the axis. These have to
   * the keys for the data objects.
   */
  @Input() protected dimensions: Array<string>;

  private lines = null;

  protected onSelectedChanged() {
    if (this.lines) {
      var self = this;
      this.lines.classed("selected", function(d) {
        return self.selected.indexOf(d) != -1;
      });
    }
  }

  protected clear() {

  }

  protected normalizeData() {
    var self = this;
    this.data.forEach(function(d) {
      self.dimensions.forEach(function(dim) {
        if (!d[dim]) {
          d[dim] = 0;
        }
      });
    });
  }

  /**
   * Fill all `dimension`s in all data objects with value 0, if no
   * value exists.
   */
  protected draw() {
    if (!this.data ||!this.dimensions) {
      return;
    }
    const self = this;

    self.normalizeData();

    var m = [30, 3, 5, 30];
    var w = 600 - m[1] - m[3];
    var h = 300 - m[0] - m[2];

    // var w = this.offsetWidth - m[1] - m[3];
    // var h = this.offsetHeight - m[0] - m[2];

    var x = d3.scale.ordinal().domain(self.dimensions).rangePoints([0, w]);
    var y = {};

    var line = d3.svg.line();
    var axis = d3.svg.axis().orient("left");

    // Helper function: returns the path for a given data point.
    function path(d) {
      return line(self.dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Add svg chart.
    var d_chart = d3.select(self.chart.nativeElement);
    var svg = d_chart.append("svg:svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
      .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    // Create a scale and brush for each dimension.
    self.dimensions.forEach(function(d) {
      self.data.forEach(function(p) { p[d] = +p[d]; });

      // Calculate domain with 5% extra space
      var extent = d3.extent(self.data, function(p) { return p[d]; });
      var size = extent[1] - extent[0];
      extent[0] = extent[0] - size*.05;
      extent[1] = extent[1] + size*.05;

      // Create the scale
      y[d] = d3.scale.linear()
        .domain(extent)
        .range([h, 0]);

      // Create the brush
      y[d].brush = d3.svg.brush()
        .y(y[d])
        .on("brush", function() {
          // Handles a brush event, toggling the display of foreground lines.
          var actives = self.dimensions.filter(function(p) { return !y[p].brush.empty(); });
          var extents = actives.map(function(p) { return y[p].brush.extent(); });
          var selection = [];
          foreground.each(function(d) {
            var selected = actives.length != 0 && actives.every(function(p, i) {
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
              });
            if (selected) {
              selection.push(d);
            }
          });
          self.selected = selection;
          self.selectedChange.emit(self.selected);
        });
    });

    // Add foreground lines.
    var foreground = svg.append("svg:g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(self.data)
      .enter().append("svg:path")
      .attr("d", path);
    self.lines = foreground;

    var i = 0;

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
      .data(self.dimensions)
      .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", function(d) {
          i = self.dimensions.indexOf(d);
        })
        .on("drag", function(d) {
          x.range()[i] = d3.event.x;
          self.dimensions.sort(function(a, b) { return x(a) - x(b); });
          g.attr("transform", function(d) { return "translate(" + x(d) + ")"; });
          foreground.attr("d", path);
        })
        .on("dragend", function(d) {
          x.domain(self.dimensions).rangePoints([0, w]);
          var t = d3.transition().duration(500);
          t.selectAll(".dimension").attr("transform", function(d) { return "translate(" + x(d) + ")"; });
          t.selectAll(".foreground path").attr("d", path);
        }));

    // Add an axis and title.
    g.append("svg:g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
      .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(String);

    // Add a brush for each axis.
    g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(y[d].brush); })
      .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

  }

}
