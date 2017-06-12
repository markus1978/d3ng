import { Component } from '@angular/core';

@Component({
  selector: 'd3ng-force-graph-demo',
  template: `
    <h2>D3ng Force Graph Demo</h2>
    <d3ng-force-graph [data]="data" [(selected)]="selection"></d3ng-force-graph>
  `,
  styles: [ 'd3ng-force-graph { width: 400px; height: 600px; }' ]
})

export class D3ngForceGraphDemoComponent {
  selection: any[] = [];
  data = [
    {
      id: "a",
      label: "DefaulA",
      color: "#f22",
      dependencies: [
        { id: "a", value: 3 },
        { id: "b", value: 4 },
        { id: "c", value: 10 }
      ]
    },
    {
      id: "b",
      label: "BarB",
      color: "#2f2",
      dependencies: [
        { id: "a", value: 1 },
        { id: "c", value: 3 }
      ]
    },
    {
      id: "c",
      label: "FooC",
      color: "#22f",
      dependencies: [
        { id: "a", value: 6 },
        { id: "b", value: 3 },
        { id: "c", value: 1 }
      ]
    },
  ];
}
