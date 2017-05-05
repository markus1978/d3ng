import {
  Component, EventEmitter, Host, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild,
} from '@angular/core';
import {VisualizationComponent} from "./visualization.component";
import {D3ngChart} from "../components/d3ng-chart";

@Component({
  selector: 'd3ng-visualization-item',
  templateUrl: 'd3ng-visualization-item.component.html' ,
  styleUrls: [ 'd3ng-visualization-item.component.css']
})

export class D3ngVisualizationItemComponent {
  @Input() title: string;
  @Input() index: number;
  @Input() source: any;
  @Input() component: string;
  @Input() config: any;

  @Input() protected selected: Array<any> = [];
  @Output() protected selectedChange = new EventEmitter<Array<any>>();

  @ViewChild('visualizationItem') visualisationItem: D3ngChart;

  private parent: VisualizationComponent;

  constructor (@Host() parent: VisualizationComponent) {
    this.parent = parent;
  }

  private onRemoveClicked():void {
    this.parent.removeItem(this.index);
  }

  @HostListener('onResizeStop', []) onResizeStop() {
    this.visualisationItem.redraw();
  }
}

