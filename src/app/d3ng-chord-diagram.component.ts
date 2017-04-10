import {
  Component, Input, OnChanges, ViewChild
} from '@angular/core';
import * as d3 from "d3";
import {D3ngChart} from "./d3ng-chart";
import {D3ngHierarchicalChart} from "./d3ng-hierarchical-chart";

@Component({
  selector: 'd3ng-chord-diagram',
  template: `
    <div #chart></div>`,
  styles: [ ]
})

export class D3ngChordDiagramComponent extends D3ngHierarchicalChart implements OnChanges {

  @ViewChild('chart') chart;


  protected onSelectedChanged() {

  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  protected draw() {

  }

}
