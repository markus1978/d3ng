import {
  Component, Input, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart} from "./d3ng-chart";
import {D3ngHierarchicalChart} from "./d3ng-hierarchical-chart";

@Component({
  selector: 'd3ng-tree-map',
  template: `
    <div #chart></div>`,
  styles: [
    ":host { height: 100%; }",
    ":host div { height: 100%; }",
    ":host /deep/ .selected rect { fill: blue !important; }",
    ":host /deep/ .selected text { fill: white; }" ]
})

export class D3ngTreeMapComponent extends D3ngHierarchicalChart implements OnChanges {

  @ViewChild('chart') chart;

  @Input() doZoom:boolean = false;

  private cell = null;


  protected drawSelected(selected:Array<any>) {
    const self = this;
    if (self.data && self.cell) {
      const selectedWithNoChildSelected = [];

      const everyWithAll = (list: Array<Object>, predicate:(Object)=>boolean) => {
        let overallResult = true;
        for (let i = 0; i < list.length; i++) {
          const result = predicate(list[i]);
          overallResult = result && overallResult;
        }
        return overallResult;
      };

      const notSelected = d => {
        const children = self.getChildren(d);
        let childNotSelected = true;
        if (children) {
          childNotSelected = everyWithAll(children, function(c) {
            return notSelected(c);
          });
        }
        const selfSelected = selected.indexOf(d) != -1;
        if (selfSelected && childNotSelected) {
          selectedWithNoChildSelected.push(d);
        }
        return childNotSelected && !selfSelected;
      };
      notSelected(this.computeHiearchyRoot());

      this.cell.classed("selected", d => {
        while (d) {
          if (selectedWithNoChildSelected.indexOf(d) != -1) {
            return true;
          }
          d = d.parent;
        }
        return false;
      });
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  protected draw() {
    const self = this;
    const data = this.computeHiearchyRoot();

    if (!data) {
      return;
    }

    const w = this.chart.nativeElement.offsetWidth;
    let h = this.chart.nativeElement.offsetHeight;

    let x = d3.scale.linear().range([0, w]),
      y = d3.scale.linear().range([0, h]),
      color = d3.scale.ordinal().range(D3ngChart.colors),
      root,
      node;

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

    const nodes = treemap.nodes(root)
      .filter(function(d) {
        // const children = self.getChildren(d);
        return self.data.indexOf(d) != -1; //!children || children.length == 0;
      });

    const cell = svg.selectAll("g")
      .data(nodes)
      .enter().append("svg:g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("click", function(d) {
        if (self.doZoom) {
          zoom(node == d.parent ? root : d.parent);
        }
        const selection = [ d ];
        self.selected = selection;
        self.selectedChange.emit(self.selected);
      });
    self.cell = cell;

    cell.append("svg:rect")
      .attr("width", function(d) { return d.dx - 1; })
      .attr("height", function(d) { return d.dy - 1; })
      .style("fill", function(d) { return color(self.getLabel(d.parent)); });

    cell.append("svg:text")
      .attr("x", function(d) { return d.dx / 2; })
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return self.getLabel(d); })
      .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

    // Add a mouseover title.
    cell.append("title").text(function(d) {
      return self.getLabel(d);
    });

    d3.select(window).on("click", function() {
      if (self.doZoom) {
        zoom(root);
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
