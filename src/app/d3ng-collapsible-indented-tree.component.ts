import {
  Component, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart} from "./d3ng-chart";
import {D3ngHierarchicalChart} from "./d3ng-hierarchical-chart";

@Component({
  selector: 'd3ng-collapsible-indented-tree',
  template: `
    <div #chart></div>`,
  styleUrls: [ './d3ng-collapsible-indented-tree.component.css' ]
})

export class D3ngCollapsibleIndentedTreeComponent extends D3ngHierarchicalChart implements OnChanges {

  @ViewChild('chart') chart;

  private d3Chart = null;

  protected drawSelected(selected:Array<any>) {
    if (this.d3Chart) {
      this.d3Chart.selectAll("span")
        .classed("selected", d => selected.indexOf(d) != -1);
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  protected draw() {
    const self = this;
    const data: any = this.computeHiearchyRoot();

    if (!data) {
      return;
    }

    var chart = d3.select(this.chart.nativeElement);

    this.d3Chart = chart;

    makeElements(chart, data);

    function makeElements(element, node){
      element
        .append("span")
        .datum(node)
        .text(self.getLabel(node))
        .on("dblclick", select)
        .on("click", click);

      const children = self.getChildren(node);
      if (children && children.length > 0) {
        element.attr("class", "closed");
        const ul = element.append("ul");
        children.forEach(function(child) {
          makeElements(ul.append("li"), child);
        });
      } else {
        element.attr("class", "empty");
      }
    }

    function select(d) {
      self.selected = [ d ];
      self.selectedChange.emit(self.selected);
    }

    function click() {
      const parent = d3.event.currentTarget.parentNode;
      if (parent.className == "closed") {
        parent.className = "open";
      } else if (parent.className == "open") {
        parent.className = "closed";
      }
    }
  }
}
