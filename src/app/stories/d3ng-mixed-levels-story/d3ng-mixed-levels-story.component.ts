import { Component, OnInit } from '@angular/core';
import {D3ngStoriesDataUtils} from "../d3ng-stories/d3ng-stories.component";

@Component({
  selector: 'd3ng-mixed-levels-story',
  templateUrl: './d3ng-mixed-levels-story.component.html',
  styleUrls: ['./d3ng-mixed-levels-story.component.css']
})
export class D3ngMixedLevelsStoryComponent {

  constructor() {

  }

  data = D3ngStoriesDataUtils.createDummyData('container', 1.5, 1.5, 0.5, (x,y)=>D3ngStoriesDataUtils.createDummyData('contents', x,y,0.15));

  dimensions = [ 'x', 'y' ]
}
