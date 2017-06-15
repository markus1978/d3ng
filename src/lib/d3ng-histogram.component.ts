import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {D3ngChart} from "./d3ng-chart";
import * as d3 from "d3";

@Component({
  selector: 'd3ng-histogram',
  templateUrl: './d3ng-histogram.component.html',
  styleUrls: ['./d3ng-histogram.component.css']
})
export class D3ngHistogramComponent extends D3ngChart {

  @ViewChild('chart') chart;

  @Input() property:string;

  private d3Chart = null;

  protected drawSelected(selected:Array<any>) {
    if (this.d3Chart) {
      this.d3Chart.classed("selected", d => selected.indexOf(d) != -1);
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
      .text(function(d) { return "# " + d[self.property]; })
      .on("click", d => {
        self.selected = [ d ];
        self.selectedChange.emit(self.selected);
      });
  }
}
