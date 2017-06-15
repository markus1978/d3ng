import {Component, OnChanges, ViewChild} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";

@Component({
  selector: 'd3ng-list',
  template: `
    <div #chart></div>`,
  styles: []
})

export class D3ngListComponent extends D3ngChart implements OnChanges {

  @ViewChild('chart') chart;

  private d3Chart = null;

  protected drawSelection(selection: D3ngSelection): void {
    if (this.d3Chart) {
      this.d3Chart.style("color", dataPoint => selection.selectionColor(dataPoint));
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
      .text(d => "# " + self.getLabel(d))
      .on("click", d => {
        self.setDirectSelection([ d ]);
      });
  }

}
