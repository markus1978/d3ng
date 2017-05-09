import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'd3ng-workbench-column',
  templateUrl: './d3ng-workbench-column.component.html',
  styleUrls: ['./d3ng-workbench-column.component.css']
})
export class D3ngWorkbenchColumnComponent implements OnInit {

  @Input() config:any;
  @Input() source:Array<Object>;

  @Input() selection: Array<any> = [];
  @Output() selectionChange = new EventEmitter<Array<any>>();

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
