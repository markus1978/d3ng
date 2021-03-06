import {Component, forwardRef, Input, OnChanges, ViewChild} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";
import {D3ngHierarchicalChart} from "./d3ng-hierarchical-chart";

@Component({
  selector: 'd3ng-tree-map',
  providers: [{provide: D3ngChart, useExisting: forwardRef(() => D3ngTreeMapComponent)}],
  template: `
    <div class="controls">
      <md-select [(ngModel)]="value" (change)="onValueChange($event)">
        <md-option *ngFor="let dim of dimensions ? dimensions : [value]" [value]="dim">{{ dim }}</md-option>
      </md-select>
    </div>
    <div #chart class="content"></div>`,
  styleUrls: [ './d3ng-tree-map.component.css' ]
})

export class D3ngTreeMapComponent extends D3ngHierarchicalChart implements OnChanges {

  @ViewChild('chart') chart;

  @Input() doZoom = false;
  @Input() value: string;
  @Input() dimensions: Array<string>;

  private cell = null;
  private color = null;

  onValueChange(event: any): void {
    this.value = event.value;
    this.clear();
    this.draw();
  }

  protected getValue(node: any): number {
    if (this.value) {
      const result = node.original[this.value];
      return result ? result : 1;
    } else {
      return 1;
    }
  }

  protected drawSelection(selection: D3ngSelection): void {
    if (this.cell) {
      this.cell.select("rect").style("fill", dataPoint => {
        const color = selection.selectionColor(dataPoint.original);
        if (color == "black") {
          return this.color(this.getLabel(dataPoint.original.parent));
        } else {
          return color;
        }
      });
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  protected draw() {
    const self = this;
    const data = this.computeHierarchyRoot();

    if (!data) {
      return;
    }

    const w = this.chart.nativeElement.offsetWidth;
    const h = this.chart.nativeElement.offsetHeight;

    const x = d3.scale.linear().range([0, w]),
      y = d3.scale.linear().range([0, h]),
      color = d3.scale.ordinal().range(D3ngChart.colors);
    let root, node;
    this.color = color;

    const treemap = d3.layout.treemap()
      .round(false)
      .size([w, h])
      .sticky(true)
      .children(function(d) {
        return self.getChildren(d);
      })
      .value(function(d) {
        return self.getValue(d);
      });

    // Add svg chart.
    const d_chart = d3.select(this.chart.nativeElement);
    const svg = d_chart.append("div")
      .attr("class", "chart")
      .style("width", w + "px")
      .style("height", h + "px")
      .append("svg:svg")
      .attr("width", w)
      .attr("height", h)
      .append("svg:g")
      .attr("transform", "translate(.5,.5)");

    node = root = data;
    const view = D3ngHierarchicalChart.createUniDirectionalHierarchyView(this, root);

    const nodes = treemap.nodes(view)
      .filter(function(d) {
        return self.data.indexOf(d.original) != -1;
      });

    const cell = svg.selectAll("g")
      .data(nodes)
      .enter().append("svg:g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("click", function(d) {
        if (self.doZoom) {
          zoom(node == d.parent ? view : d.parent);
        }
        self.setDirectSelection([d.original]);
      });
    self.cell = cell;

    cell.append("svg:rect")
      .attr("width", function(d) { return d.dx - 1; })
      .attr("height", function(d) { return d.dy - 1; })
      .style("fill", function(d) { return color(self.getLabel(d.original.parent)); });

    cell.append("svg:text")
      .attr("x", function(d) { return d.dx / 2; })
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return self.getLabel(d.original); })
      .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

    // Add a mouseover title.
    this.appendTooltip(cell, d => this.getQualifiedLabel(d.original));

    d3.select(window).on("click", function() {
      if (self.doZoom) {
        zoom(view);
      }
    });

    function zoom(d) {
      const kx = w / d.dx, ky = h / d.dy;
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      const t = svg.selectAll("g.cell").transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      t.select("rect")
        .attr("width", function(d) { return kx * d.dx - 1; })
        .attr("height", function(d) { return ky * d.dy - 1; });

      t.select("text")
        .attr("x", function(d) { return kx * d.dx / 2; })
        .attr("y", function(d) { return ky * d.dy / 2; })
        .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });

      node = d;
      d3.event.stopPropagation();
    }
  }

}
