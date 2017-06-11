import {
  AfterContentInit,
  Component, ContentChild, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
import {D3ngChart} from "./d3ng-chart";

export class D3ngGroupContext {
  public groups: D3ngGroup[] = [new D3ngGroup(), new D3ngGroup(), new D3ngGroup(), new D3ngGroup() ];
}

@Component({
  selector: 'd3ng-groups',
  template: `
    <div class="container">
      <div class="controls">
        <div class="group-controls">
          <d3ng-group-selection [(value)]="chart.currentSelectionGroup" [groups]="groups"></d3ng-group-selection>
        </div>
        <div class="selection-controls">
          <!--<md-slide-toggle color="warn" [(checked)]="isHold"></md-slide-toggle>-->
        </div>
      </div>
      <div class="content">
        <ng-content></ng-content>  
      </div>
    </div>  
  `,
  styles: [
    ':host { display: block; }',
    '.container, .content { height: 100%; }',
    '.controls { position: relative; }',
    '.selection-controls { position: absolute; left: 0px; z-index: 1000; }',
    '.group-controls { position: absolute; right: 10px; z-index: 1000;}',
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
export class D3ngGroupsComponent implements AfterContentInit, OnDestroy {

  @ContentChild(D3ngChart) chart: D3ngChart;
  @Input() context: D3ngGroupContext = null;
  @Input() groups: number[] = [0];
  @Output() selectedChanged = new EventEmitter<{group: number, selected: any[]}>();

  private isHold = false;
  private groupEventHandlers = [];

  constructor() {

  }

  public ngAfterContentInit() {
    if (!this.context) {
      throw new Error("No group context set.");
    }
    this.chart.selectedChange.subscribe(selected => this.onDirectSelectedChanged(selected));
    if (this.groups.indexOf(this.chart.currentSelectionGroup) == -1) {
      this.chart.currentSelectionGroup = this.groups[0];
    }
    this.groups.forEach(group => {
      const handler = selected => {
        this.onIndirectSelectedChanged(group, selected);
      };
      this.groupEventHandlers.push(handler);
      this.context.groups[group].subscribe(handler);
    });
    const order = this.groups.slice(0);
    [0, 1, 2, 3].forEach(g => {
      if (order.indexOf(g) == -1) {
        order.push(g);
      }
    });
    this.chart.groupOrder = order;
  }

  private onIndirectSelectedChanged(group: number, selected: Array<any>) {
    this.chart.onIndirectSelectionChanged(selected, group);
    this.selectedChanged.emit({group: group, selected: selected});
  }

  private onDirectSelectedChanged(selected: Array<any>) {
    this.context.groups[this.chart.currentSelectionGroup].onDirectSelectedChanged(this.chart, selected);
  }

  ngOnDestroy() {
    this.groups.forEach(group => {
      this.context.groups[group].cancelSubscription(this.groupEventHandlers[group]);
    });
  }
}

class D3ngGroup {
  private selections: Map<D3ngChart, Array<any>> = new Map<D3ngChart, Array<any>>();
  private handler: Array<(selected: any[]) => void> = [];

  constructor() {}

  public onDirectSelectedChanged(chart: D3ngChart, selected: Array<any>) {
    if (!selected) {
      throw new Error("Selected must be defined.");
    }
    this.selections.set(chart, selected);
    const indirectSelected = this.getSelected();

    this.handler.forEach(handler => handler(indirectSelected));
  }

  public getSelected() {
    const selected = [];
    for (const selection of this.selections.values()) {
      selection.forEach(s => {
        if (selected.indexOf(s) != 1) {
          selected.push(s);
        }
      });
    }
    return selected;
  }

  public subscribe(handler: (selected: Array<any>) => void) {
    this.handler.push(handler);
  }

  public cancelSubscription(handler: any) {
    const index = this.handler.indexOf(handler);
    if (index != -1) {
      this.handler.splice(index, 1);
    }
  }
}
