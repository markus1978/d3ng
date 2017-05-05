import {Component, Host, Input} from '@angular/core';
import {VisualizationComponent} from "./visualization.component";

@Component({
  selector: 'd3ng-visualization-item',
  templateUrl: 'd3ng-visualization-item.component.html' ,
  styleUrls: [ 'd3ng-visualization-item.component.css']
})

export class D3ngVisualizationItemComponent {
  @Input() title: string;
  @Input() content: string;
  @Input() index: number;

  parent: VisualizationComponent;

  constructor (@Host() parent: VisualizationComponent) {
    this.parent = parent;
  }

  private onRemoveClicked():void {
    this.parent.removeItem(this.index);
  }

  private onEditClicked():void {
    this.title = "huhuh";
  }
}

