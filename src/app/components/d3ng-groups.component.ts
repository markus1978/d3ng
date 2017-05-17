import {
  AfterContentInit,
  Component, ContentChild, ContentChildren, Input, OnChanges, OnInit, QueryList, SimpleChanges
} from '@angular/core';
import {D3ngChart} from "./d3ng-chart";

@Component({
  selector: 'd3ng-groups',
  template: `
    <div class="container">
      <div class="controls">
        <md-button-toggle-group #group="mdButtonToggleGroup" [(ngModel)]="this.chart.currentSelectionGroup">
          <md-button-toggle *ngFor="let group of groups" [value]="group" [class]="'group-btn-'+group">
            &nbsp;
          </md-button-toggle>
        </md-button-toggle-group>
      </div>
      <div class="content">
        <ng-content></ng-content>  
      </div>
    </div>  
  `,
  styles: [
    ':host { display: block; }',
    '.container, .content { height: 100%; }',
    '.controls { position: absolute; z-index: 1000; }',
    'md-button-toggle-group { height: 15px; }',
    '.mat-button-toggle-checked { border: solid grey 1px; }',
    '.group-btn-0.mat-button-toggle-checked { background-color: #9E2622; }',
    '.group-btn-0:not(.mat-button-toggle-checked) {background-color: #CC8574; }',
    '.group-btn-1.mat-button-toggle-checked { background-color: #005A9C; }',
    '.group-btn-1:not(.mat-button-toggle-checked) {background-color: #B3C1DF; }',
    '.group-btn-2.mat-button-toggle-checked { background-color: #D4C48E; }',
    '.group-btn-2:not(.mat-button-toggle-checked) {background-color: #E8DEC0; }',
    '.group-btn-3.mat-button-toggle-checked { background-color: #76A58E; }',
    '.group-btn-3:not(.mat-button-toggle-checked) {background-color: #006C45; }',
  ]
})

export class D3ngGroupsComponent implements AfterContentInit {

  @ContentChild(D3ngChart) chart: D3ngChart;
  @Input() groups: number[] = [0];

  constructor() {}

  public ngAfterContentInit() {
    this.chart.selectedChange.subscribe(selected => this.onDirectSelectedChanged(selected));
    this.chart.currentSelectionGroup = this.groups[0];
    this.groups.forEach(group=>{
      D3ngGroup.groups[group].subscribe(selected => {
        this.onIndirectSelectedChanged(group, selected);
      });
    });
  }

  private onIndirectSelectedChanged(group:number, selected:Array<any>) {
    this.chart.onIndirectSelectionChanged(selected, group);
  }

  private onDirectSelectedChanged(selected: Array<any>) {
    D3ngGroup.groups[this.chart.currentSelectionGroup].onDirectSelectedChanged(this.chart, selected);
  }
}

class D3ngGroup {
  public static groups: D3ngGroup[] = [new D3ngGroup(), new D3ngGroup(), new D3ngGroup(), new D3ngGroup() ];
  private selections:Map<D3ngChart, Array<any>> = new Map<D3ngChart, Array<any>>();
  private handler: Array<(selected:any[])=>void> = [];

  constructor() {}

  public onDirectSelectedChanged(chart:D3ngChart, selected: Array<any>) {
    this.selections.set(chart, selected);
    const indirectSelected = [];
    for (let selection of this.selections.values()) {
      selection.forEach(s=>{
        if (indirectSelected.indexOf(s) != 1) {
          indirectSelected.push(s);
        }
      });
    }

    this.handler.forEach(handler=> handler(indirectSelected));
  }

  public subscribe(handler:(selected:Array<any>)=>void) {
    this.handler.push(handler);
  }
}
