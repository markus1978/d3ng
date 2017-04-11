import { Component } from '@angular/core';
import {D3ngChart} from "../d3ng-chart";

@Component({
  selector: 'd3ng-chord-diagram-demo',
  template: `
    <h2>D3ng Chord Diagram Demo</h2>
    <d3ng-chord-diagram [data]="data" [(selected)]="selection"></d3ng-chord-diagram>
  `,
  styles: [ 'd3ng-chord-diagram { width : 300px; }' ]
})

export class D3ngChordDiagramDemoComponent {
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
  ]
}
