import {
  Component, Input, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart} from "./d3ng-chart";
import {D3ngHierarchicalChart} from "./d3ng-hierarchical-chart";
import {D3ngDependencyChart} from "./d3ng-dependency-chart";

@Component({
  selector: 'd3ng-radial-edge-bundling',
  template: `    
    <div class="controls">
      <md-slider min="0" max="100" value="85" (change)="onTensionChange($event)"></md-slider>
    </div>
    <div #chart class="content"></div>
  `,
  styleUrls: [ './d3ng-radial-edge-bundling.component.css' ]
})

export class D3ngRadialEdgeBundlingComponent extends D3ngDependencyChart implements OnChanges {

  @ViewChild('chart') chart;
  @ViewChild('container') container;

  private currentSelection:Array<any> = [];

  private svg: any;
  private line: any;
  private path: any;
  private splines: Array<any>;


  protected drawSelected(selected:Array<any>) {
    if (this.svg) {
      this.currentSelection.forEach(d=>this.mouseout(d));
      this.svg.selectAll(".node").classed("selected", d => selected.indexOf(d.original) != -1);
      this.currentSelection = [];
      selected.forEach(d=> {
        this.currentSelection.push(d);
        this.mouseover(d);
      });
    }
  }

  private onTensionChange(event: any):void {
    this.line.tension(event.value / 100);
    this.path.attr("d", (d, i) => this.line(this.splines[i]));
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  public getId(node) {
    return super.getId(node).replace(/\//g, "-");
  }

  protected draw() {
    const self = this;

    if (!this.data || this.data.length == 0) {
      return;
    }

    const w = this.chart.nativeElement.offsetWidth,
      h = this.chart.nativeElement.offsetWidth,
      rx = w / 2,
      ry = h / 2;
    let m0,
      rotate = 0;

    const cluster = d3.layout.cluster()
      .size([360, ry - 120])
      .sort((a, b) => d3.ascending(self.getId(a.original), self.getId(b.original)));

    const bundle = d3.layout.bundle();

    this.line = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.85)
      .radius(d => viewMapping[self.getId(d)].y)
      .angle(d => viewMapping[self.getId(d)].x / 180 * Math.PI);

    const div = d3.select(this.chart.nativeElement).insert("div", "h2")
      .style("width", w + "px")
      .style("height", w + "px")

    const svg = div.append("svg:svg")
      .attr("width", w)
      .attr("height", w)
      .append("svg:g")
      .attr("transform", "translate(" + rx + "," + ry + ")");
    this.svg = svg;

    svg.append("svg:path")
      .attr("class", "arc")
      .attr("d", d3.svg.arc().outerRadius(ry - 120).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
      .on("mousedown", mousedown);

    const root = D3ngHierarchicalChart.computeHierarchyRoot(self, this.data);
    const viewMapping = {};
    const view = D3ngHierarchicalChart.createHierarchyView(self, root, viewMapping, d => self.getId(d));
    const nodes = cluster.nodes(view);
    const links = this.computeObjectGraphFromData().links;
    this.splines = bundle(links);

    this.path = svg.selectAll("path.link")
      .data(links)
      .enter().append("svg:path")
      .attr("class", d =>  "link source-" + self.getId(d.source) + " target-" + self.getId(d.target))
      .attr("d", (d, i) => this.line(this.splines[i]));

    svg.selectAll("g.node")
      .data(nodes.filter(function (n) {
        return !n.children;
      }))
      .enter().append("svg:g")
      .attr("class", "node")
      .attr("id", d => d.original.id)
      .attr("transform", d => "rotate(" + (d.x - 90) + ")translate(" + d.y + ")")
      .append("svg:text")
      .attr("dx", d => d.x < 180 ? 8 : -8)
      .attr("dy", ".31em")
      .attr("text-anchor", d => d.x < 180 ? "start" : "end")
      .attr("transform", d => d.x < 180 ? null : "rotate(180)")
      .text(d => self.getLabel(d.original))
      .on("mouseover", d => self.mouseover(d.original))
      .on("mouseout", d => {
        if (this.currentSelection.indexOf(d.original) == -1) {
          self.mouseout(d.original);
        }
      })
      .on("click", (d) => {
        self.selected = [ d.original ];
        self.selectedChange.emit(self.selected);
      });

    d3.select(window)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup);

    function mouse(e) {
      return [e.pageX - rx, e.pageY - ry];
    }

    function mousedown() {
      m0 = mouse(d3.event);
      d3.event.preventDefault();
    }

    function mousemove() {
      if (m0) {
        const m1 = mouse(d3.event),
          dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
        div.style("-webkit-transform", "translateY(" + (ry - rx) + "px)rotateZ(" + dm + "deg)translateY(" + (rx - ry) + "px)");
      }
    }

    function mouseup() {
      if (m0) {
        const m1 = mouse(d3.event);
        rotate += Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
        if (rotate > 360) rotate -= 360;
        else if (rotate < 0) rotate += 360;
        m0 = null;

        div.style("-webkit-transform", null);

        svg
          .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
          .selectAll("g.node text")
          .attr("dx", function (d) {
            return (d.x + rotate) % 360 < 180 ? 8 : -8;
          })
          .attr("text-anchor", function (d) {
            return (d.x + rotate) % 360 < 180 ? "start" : "end";
          })
          .attr("transform", function (d) {
            return (d.x + rotate) % 360 < 180 ? null : "rotate(180)";
          });
      }
    }

    function cross(a, b) {
      return a[0] * b[1] - a[1] * b[0];
    }

    function dot(a, b) {
      return a[0] * b[0] + a[1] * b[1];
    }
  }

  private mouseover(d) {
    this.svg.selectAll("path.link.target-" + this.getId(d))
      .classed("target", true)
      .each(this.updateNodes("source", true));

    this.svg.selectAll("path.link.source-" + this.getId(d))
      .classed("source", true)
      .each(this.updateNodes("target", true));
  }

  private  mouseout(d) {
    this.svg.selectAll("path.link.source-" + this.getId(d))
      .classed("source", false)
      .each(this.updateNodes("target", false));

    this.svg.selectAll("path.link.target-" + this.getId(d))
      .classed("target", false)
      .each(this.updateNodes("source", false));
  }

  private updateNodes(name, value) {
    const self = this;
    return function (d) {
      if (value) this.parentNode.appendChild(this);
      self.svg.select("#node-" + self.getId(d[name])).classed(name, value);
    };
  }
}