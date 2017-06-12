import { Component } from '@angular/core';

@Component({
  selector: 'd3ng-histogram-demos',
  template: `
    <h2>D3ng Histogram Demo</h2>
    <d3ng-histogram [data]="listData" [(selected)]="selection" property="a"></d3ng-histogram>
    
    <h3>Control list</h3>
    <d3ng-list [data]="listData" [(selected)]="selection" labelKey="a"></d3ng-list>
  `,
  styles: [ 'd3ng-histogram { height : 300px; display:block; }' ]
})

export class D3ngHistogramDemoComponent {
  selection: any[] = [];
  listData = [
    { a: "One", b: 2, c:"++" },
    { a: "Two" },
    { a: "Two" },
    { a: "Threes" },
    { a: "Threes" },
    { a: "Four" },
    { a: "One" },
    { a: "One" },
    { a: "One" },
  ];
}
