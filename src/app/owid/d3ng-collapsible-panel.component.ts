import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Http, Response} from "@angular/http";
import {D3ngParallelCoordinatesComponent} from "../../lib/d3ng-parallel-coordinates.component";
import {D3ngCollapsibleIndentedTreeComponent} from "../../lib/d3ng-collapsible-indented-tree.component";
import * as d3 from "d3";
import {D3ngGroupContext} from "../../lib/d3ng-groups.component";
import {D3ngMapComponent} from "../../lib/d3ng-map.component";
import {Observable} from "rxjs/Observable";
import * as jsonata from "jsonata";

@Component({
  selector: 'd3ng-collapsible-panel',
  template: `    
    <div class="collapsible-panel-info">
      <i class="material-icons" (click)="switchState()">{{currentIcon}}</i>
      <div class="info">
        <ng-content select=".info"></ng-content>
      </div>
    </div>
    <div class="collapsible-panel-content" *ngIf="isOpen"><ng-content></ng-content></div>
  `,
  styles: [
    `.material-icons {
      font-size: 16px;
      vertical-align: middle;
      line-height: 1px;
      position: absolute;
      top: 10px; right: 0;
    }`,
    `.collapsible-panel-info .info {
      margin-right: 20px;
    }`,
    `.collapsible-panel-info {
      position: relative;
    }
    `]
})
export class D3ngCollapsiblePanelComponent {
  @Input() info = "";
  @Input() isOpen = true;
  currentIcon = 'remove_circle_outline';

  switchState(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.currentIcon = 'remove_circle_outline';
    } else {
      this.currentIcon = 'add_circle_outline';
    }
  }
}
