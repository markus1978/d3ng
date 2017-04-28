import {
  Component, Input, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart} from "./d3ng-chart";
import {D3ngDependencyChart} from "./d3ng-dependency-chart";

@Component({
  selector: 'd3ng-force-graph',
  template: `
    <div #chart></div>`,
  styleUrls: [ './d3ng-force-graph.component.css']
})

export class D3ngForceGraphComponent extends D3ngDependencyChart implements OnChanges {

  @ViewChild('chart') chart;
  @Input() size: string;

  private d3Chart = null;

  protected drawSelected(selected:Array<any>) {
    if (this.d3Chart && selected) {
      this.d3Chart.selectAll("circle").classed("selected", d => selected.indexOf(d.data) != -1);
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  private computeGraphFromData():any {
    const self = this;
    const graph:any = {};
    graph.nodes = [];
    graph.links = [];
    const groupIds = {};
    let groupIdGenerator = 0;
    const indexes = {};

    this.data.forEach(d => {
      const id = self.getId(d);
      const group: any = self.getId(self.getParent(d));
      if (!groupIds[group]) {
        groupIds[group] = groupIdGenerator++;
      }

      indexes[id] = graph.nodes.length;
      graph.nodes.push({"id": id, "data": d, "group": groupIds[group]});
    });

    this.data.forEach(d => {
      const dependencies = self.getDependencies(d);
      if (dependencies) {
        dependencies.forEach(dep => {
          const targetIndex = indexes[self.getId(dep)];
          if (targetIndex) {
            graph.links.push({
              "source": indexes[self.getId(d)],
              "target": targetIndex,
              "value": self.getValue(dep)
            });
          }
        });
      }
    });

    return graph;
  }

  protected draw() {
    const self = this;
    if (!self.data) {
      return;
    }
    const graph = self.computeGraphFromData();

    const width = self.chart.nativeElement.offsetWidth;
    const height = self.chart.nativeElement.offsetHeight;

    const svg = d3.select(self.chart.nativeElement)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    self.d3Chart = svg;

    const force = d3.layout.force()
      .gravity(0.05)
      .distance(50)
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
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("r", 5  )
      .attr("fill", d => D3ngChart.colors[d.group%D3ngChart.colors.length])
      .call(force.drag)
      .on("click", d => {
        self.selected = [ d.data ];
        self.selectedChange.emit(self.selected);
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
