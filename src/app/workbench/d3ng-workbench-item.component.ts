import {
  Component, EventEmitter, Host, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild,
} from '@angular/core';
import {D3ngChart} from "../components/d3ng-chart";
import {D3ngWorkbenchComponent} from "./d3ng-workbench.component";

@Component({
  selector: 'd3ng-workbench-item',
  templateUrl: 'd3ng-workbench-item.component.html' ,
  styleUrls: [ 'd3ng-workbench-item.component.css']
})

export class D3ngWorkbenchItemComponent {
  @Input() title: string;
  @Input() index: number;
  @Input() source: Array<Object>;
  @Input() component: string;
  @Input() config: any;

  @Input() protected selected: Array<any> = [];
  @Output() protected selectedChange = new EventEmitter<Array<any>>();

  @ViewChild('item') workbenchItem: D3ngChart;

  private workbench: D3ngWorkbenchComponent;

  constructor (@Host() parent: D3ngWorkbenchComponent) {
    this.workbench = parent;
  }

  private onRemoveClicked():void {
    this.workbench.removeItem(this.index);
  }

  @HostListener('onResizeStop', []) onResizeStop() {
    this.workbenchItem.redraw();
  }
}

