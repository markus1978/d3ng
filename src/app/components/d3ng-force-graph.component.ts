import {
  Component, forwardRef, Input, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";
import {D3ngDependencyChart} from "./d3ng-dependency-chart";

@Component({
  selector: 'd3ng-force-graph',
  providers: [{provide: D3ngChart, useExisting: forwardRef(() => D3ngForceGraphComponent)}],
  template: `
    <div class="controls">
      <md-select [(ngModel)]="nodeValue" (change)="onNodeValueChange($event)">
        <md-option *ngFor="let dim of nodeDimensions ? nodeDimensions : [nodeValue]" [value]="dim">{{ dim }}</md-option>
      </md-select>
    </div>
    <div #chart class="content"></div>`,
  styleUrls: [ './d3ng-force-graph.component.css']
})

export class D3ngForceGraphComponent extends D3ngDependencyChart implements OnChanges {

  @ViewChild('chart') chart;
  @Input() nodeValue: string;
  @Input() nodeDimensions: Array<string>;

  private d3Chart = null;

  private onNodeValueChange(event: any): void {
    this.nodeValue = event.value;
    this.clear();
    this.draw();
  }

  protected drawSelection(selection: D3ngSelection): void {
    if (this.d3Chart) {
      this.d3Chart.selectAll("circle")
        .classed("selected", dataPoint => selection.isSelected(dataPoint.data))
        .style("stroke", dataPoint => selection.selectionColor(dataPoint.data));
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  protected getNodeValue(node: any): number {
    if (this.nodeValue) {
      const result = this.nodeValue ? node[this.nodeValue] : 1;
      return result ? result : 1;
    } else {
      return 1;
    }
  }

  private color(index: number): string {
    return D3ngChart.colors[index % D3ngChart.colors.length];
  }

  protected draw() {
    const self = this;
    if (!self.data || self.data.length == 0) {
      return;
    }
    const graph = self.computeIndexGraphFromData();

    const width = self.chart.nativeElement.offsetWidth;
    const height = self.chart.nativeElement.offsetHeight;

    const svg = d3.select(self.chart.nativeElement)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    self.d3Chart = svg;

    const maxValue = d3.extent(this.data, d => this.getNodeValue(d))[1];

    const force = d3.layout.force()
      .gravity(0.05)
      .distance(80)
      .charge(-50)
      .size([width, height])
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", d => {
        return Math.sqrt(d.value);
      });

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("r", d => {
        return 30 * (this.getNodeValue(d.data) / maxValue) + 3;
      })
      .attr("fill", d => self.color(d.group))
      .call(force.drag)
      .on("click", d => {
        self.setDirectSelection([ d.data ]);
      });

    node.append("title").text(d => self.getQualifiedLabel(d.data));

    force.on("tick", () => {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    });
  }

}
