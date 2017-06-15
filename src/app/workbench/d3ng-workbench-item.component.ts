import {
  Component, EventEmitter, Host, HostListener, Input, Output, ViewChild,
} from '@angular/core';
import {D3ngChart} from "../../lib/d3ng-chart";
import {D3ngWorkbenchComponent} from "./d3ng-workbench.component";
import {D3ngGroupContext} from "../../lib/d3ng-groups.component";

@Component({
  selector: 'd3ng-workbench-item',
  templateUrl: 'd3ng-workbench-item.component.html' ,
  styleUrls: [ 'd3ng-workbench-item.component.css']
})

export class D3ngWorkbenchItemComponent {
  @Input() title: string;
  @Input() index: number;
  @Input() source: Array<Object>;
  @Input() pattern: string;
  @Input() component: string;
  @Input() config: any;
  @Input() groups: number[];
  @Input() context: D3ngGroupContext;

  @ViewChild('item') workbenchItem: D3ngChart;

  constructor (@Host() private workbench: D3ngWorkbenchComponent) { }

  onRemoveClicked():void {
    this.workbench.removeItem(this.index);
  }

  @HostListener('onResizeStop', []) onResizeStop() {
    this.workbenchItem.redraw();
  }
}
