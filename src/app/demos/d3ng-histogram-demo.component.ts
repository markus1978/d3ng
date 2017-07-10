import { Component } from '@angular/core';

@Component({
  selector: 'd3ng-histogram-demos',
  template: `
    <h2>D3ng Histogram Demo</h2>
    <d3ng-histogram [data]="data" [(selected)]="selection" valueKey="a"  [multiselect]="true"></d3ng-histogram>
    <d3ng-list [(selected)]="selection" [data]="data" [multiselect]="true" [customLabel]="label"></d3ng-list>
  `,
  styles: [ 'd3ng-histogram { height : 300px; display:block; }' ]
})

export class D3ngHistogramDemoComponent {
  selection: any[] = [];

  data = [
    { a: 1 },
    { a: 2 },
    { a: 2 },
    { a: 3 },
    { a: 3 },
    { a: 4 },
    { a: 1 },
    { a: 1 },
    { a: 1 }
  ];

  label = function(d) {
    return d.a;
  };
}
