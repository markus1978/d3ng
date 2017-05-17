import {
  Component, Input, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";
import {D3ngDependencyChart} from "./d3ng-dependency-chart";

@Component({
  selector: 'd3ng-chord-diagram',
  template: `
    <div #chart></div>`,
  styleUrls: [ './d3ng-chord-diagram.component.css' ]
})

export class D3ngChordDiagramComponent extends D3ngDependencyChart implements OnChanges {

  @ViewChild('chart') chart;

  private indexes = null;
  private group = null;
  private chord = null;

  protected drawSelection(selection: D3ngSelection): void {
    if (this.group && this.chord) {
      this.group.select("path").style("fill", group => {
        const color = selection.selectionColor(group, (selected, group) => {
          return !selected.every(dataPoint => group.index != this.indexes[this.getId(dataPoint)]);
        });
        if (color != "black") {
          return color;
        } else {
          return this.color(group.index);
        }
      });
      this.chord.style("fill", chord => {
        const color = selection.selectionColor(chord, (selected, chord) => {
          return !selected.every(dataPoint => {
            const selectedIndex = this.indexes[this.getId(dataPoint)];
            return !(chord.source.index == selectedIndex || chord.target.index == selectedIndex);
          });
        });
        if (color != "black") {
          return color;
        } else {
          return this.color(chord.source.index);
        }
      });
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  private color(index: number) {
    return D3ngChart.colors[index % D3ngChart.colors.length];
  }

  protected draw() {
    const self = this;

    if (!this.data) {
      return;
    }

    let width = this.chart.nativeElement.offsetWidth,
      height = this.chart.nativeElement.offsetHeight;

    if (height < width && height > 0) {
      width = height;
    } else {
      height = width;
    }

    const outerRadius = Math.min(width, height) / 2 - 10,
      innerRadius = outerRadius - 24;

    const formatPercent = d3.format(".1%");

    const arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const layout = d3.layout.chord()
      .padding(.04)
      .sortSubgroups(d3.descending)
      .sortChords(d3.ascending);

    const path = d3.svg.chord()
      .radius(innerRadius);

    // Add svg chart.
    const d_chart = d3.select(this.chart.nativeElement);
    const svg = d_chart.append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("id", "circle")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("circle")
      .attr("r", outerRadius);

    // compute the chord matrix
    const indexes = {};
    for (let i = 0; i < self.data.length; i++) {
      indexes[self.getId(self.data[i])] = i;
    }
    const matrix = [];
    self.data.forEach(function(it) {
      const values = Array.apply(null, Array(self.data.length)).map(Number.prototype.valueOf, 0);
      const dependencies = self.getDependencies(it);
      if (dependencies) {
        dependencies.forEach(function(dep) {
          values[indexes[self.getId(dep)]] = self.getValue(dep);
        });
      }
      matrix[indexes[self.getId(it)]] = values;
    });
    self.indexes = indexes;

    // Compute the chord layout.
    layout.matrix(matrix);

    // Add a group per neighborhood.
    const group = svg.selectAll(".group")
      .data(layout.groups)
      .enter().append("g")
      .attr("class", "group")
      .on("mouseover", mouseover)
      .on("click", click);
    self.group = group;

    // Add a mouseover title.
    group.append("title").text(function(d, i) {
      return self.getQualifiedLabel(self.data[i]);
    });

    // Add the group arc.
    const groupPath = group.append("path")
      .attr("id", function(d, i) { return "group" + i; })
      .attr("d", arc)
      .style("fill", function(d, i) { return self.color(i); });

    // Add a text label.
    const groupText = group.append("text")
      .attr("x", 6)
      .attr("dy", 15);

    groupText.append("textPath")
      .attr("xlink:href", function(d, i) { return "#group" + i; })
      .text(function(d, i) { return self.data[i].label; });

    // Remove the labels that don't fit. :(
    groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
      .remove();

    // Add the chords.
    const chord = svg.selectAll(".chord")
      .data(layout.chords)
      .enter().append("path")
      .attr("class", "chord")
      .style("fill", function(d) { return self.color(d.source.index); })
      .attr("d", path);
    self.chord = chord;

    function mouseover(d, i) {
      chord.classed("fade", function(p) {
        return p.source.index != i
          && p.target.index != i;
      });
    }

    function click(d, i) {
      const isDeselect = self.selected && self.selected.length == 1 && indexes[self.selected[0]] == i;
      if (isDeselect) {
        self.selected = [];
      } else {
        self.selected = self.data
          .filter(function(f) {
            return indexes[self.getId(f)] == i;
          });
      }
      self.selectedChange.emit(self.selected);
    }
  }

}
