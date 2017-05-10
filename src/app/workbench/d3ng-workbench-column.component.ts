import {Component, EventEmitter, Host, Input, OnInit, Output} from '@angular/core';
import {D3ngWorkbenchComponent} from "./d3ng-workbench.component";

@Component({
  selector: 'd3ng-workbench-column',
  templateUrl: './d3ng-workbench-column.component.html',
  styleUrls: ['./d3ng-workbench-column.component.css']
})
export class D3ngWorkbenchColumnComponent implements OnInit {

  @Input() config:any;
  @Input() source:Array<Object>;
  @Input() isLast:boolean = false;

  @Input() selection: Array<any> = [];
  @Output() selectionChange = new EventEmitter<Array<any>>();

  workbench:D3ngWorkbenchComponent;

  chart:any = null;

  gridConfig = {
    resizeable: true,
    margins: [5,5],
    max_cols: 5,
    col_width: 170,
    row_height: 170,
  };

  items = [];
  data = {};

  constructor (@Host() parent: D3ngWorkbenchComponent) {
    this.workbench = parent;
  }

  public ngOnInit() {
    this.chart = this.config.charts[0];
  }

  private createGridItemConfig():any {
    return {
      sizex: 2,
      sizey: 2,
      borderSize: 5,
      resizeable: true,
      dragHandle: '.title'
    }
  }

  private removeClicked() {
    this.workbench.removeColumn(this);
  }

  private addClicked() {
    const config = {
      component: this.chart.type,
      pattern: this.chart.pattern,
      dimensions: this.config.dimensions,
      scroll: this.chart.scroll
    };
    this.chart.dimensionProperties.forEach(dim=>{
      config[dim.name] = dim.value;
    });
    this.items.push({
      gridItemConfig: this.createGridItemConfig(),
      config: config,
      name: this.chart.name
    })
  }

  public removeItem(index:number) {
    this.items.splice(index, 1);
  }

}
