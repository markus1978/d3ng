import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'd3ng-story',
  templateUrl: './d3ng-story.component.html',
  styleUrls: ['./d3ng-story.component.css']
})
export class D3ngStoryComponent implements OnInit {

  @Input() title;

  constructor() { }

  ngOnInit() {
  }

}

export abstract class D3ngStoryBase {
  public data = this.createDummyData('container', 1.5, 1.5, 0.5, (x,y)=>this.createDummyData('contents', x,y,0.15));
  public scatterPlotConfig = {
    extent: [[0.5,2.5],[0.5,2.5]],
    ticks: [5,5]
  };
  public dimensions = [ 'x', 'y' ];
  private createDummyData(t, x, y, size, childrenFunction?:(x,y)=>any) {
    return [
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ].map(o => {
      const result = {
        type: t,
        x: (o.x * size + x),
        y: (o.y * size + y),
      };
      if (childrenFunction) {
        result['children'] = childrenFunction(result.x, result.y);
      }
      return result;
    });
  }
}
