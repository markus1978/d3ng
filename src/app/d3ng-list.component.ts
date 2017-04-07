import {
  Component, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart} from "./d3ng-chart";

@Component({
  selector: 'd3ng-list',
  template: `
    <div #chart></div>`,
  styles: [ ':host /deep/ .selected { color: blue; }']
})

export class D3ngListComponent extends D3ngChart implements OnChanges {

  @ViewChild('chart') chart;

  private d3Chart = null;

  protected onSelectedChanged() {
    if (this.d3Chart) {
      var self = this;
      this.d3Chart.classed("selected", function (d) {
        return self.selected.indexOf(d) != -1;
      });
    }
  }

  protected clear() {

  }

  protected draw() {
    const self = this;
    this.d3Chart = d3.select(this.chart.nativeElement)
      .selectAll("p")
      .data(this.data)
      .enter().append("p")
      .text(function(d) { return "# " + self.getLabel(d); })
      .on("click", function(d) {
        self.selected = [ d ];
        self.selectedChange.emit(self.selected);
      });
  }

}
