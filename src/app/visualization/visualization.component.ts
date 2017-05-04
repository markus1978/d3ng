import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css']
})
export class VisualizationComponent implements OnInit {

  gridConfig = {
    resizeable: true,
    margins: [5,5]
  }

  items = [
    {
      gridItemConfig: this.createGridItemConfig(),
      name: "Hello 1",
      content: "Lerim impsum dolar haris mador it esto glad."
    },
    {
      gridItemConfig: this.createGridItemConfig(),
      name: "Hello 2",
      content: "Lerim impsum dolar haris mador it esto glad."
    },
  ]

  private createGridItemConfig():any {
    return {
      borderSize: 5,
      resizeable: true
    }
  }

  constructor() { }

  ngOnInit() {
  }

}
