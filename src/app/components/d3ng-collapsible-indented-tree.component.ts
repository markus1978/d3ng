import {
  Component, Input, OnChanges, ViewChild
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
  @Input() rootLabel: string = "ROOT";

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
    const data: any = this.computeHierarchyRoot();

    if (!data) {
      return;
    }

    var chart = d3.select(this.chart.nativeElement);

    this.d3Chart = chart;

    makeElements(chart, data);

    function makeElements(element, node){
      var label = self.getLabel(node);
      if (!label ||label == "") {
        label = self.rootLabel;
      }
      const children = self.getChildren(node);

      const nodeContainer = element
        .append("div")
        .attr("class", (children && children.length > 0) ? "closed" : "empty")
        .datum(node);

      nodeContainer.append("i")
        .attr("class", "material-icons")
        .text((children && children.length > 0) ? "add_circle_outline" : "keyboard_arrow_right")
        .on("click", click);

      nodeContainer.append("span")
        .text(label)
        .on("click", select);

      if (children && children.length > 0) {
        const ul = nodeContainer.append("ul");
        children.forEach(function(child) {
          makeElements(ul.append("li"), child);
        });
      }
    }

    function select(d) {
      self.selected = [ d ];
      self.selectedChange.emit(self.selected);
    }

    function click() {
      const icon = d3.event.currentTarget;
      const nodeContainer = icon.parentNode;
      if (nodeContainer.className == "closed") {
        nodeContainer.className = "open";
        icon.innerHTML = "remove_circle_outline";
      } else if (nodeContainer.className == "open") {
        nodeContainer.className = "closed";
        icon.innerHTML = "add_circle_outline";
      }
    }
  }
}
