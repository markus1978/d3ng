import { Component, OnInit } from '@angular/core';
import {D3ngSelectionGroupStoryComponent} from "../d3ng-selection-group-story/d3ng-selection-group-story.component";
import {D3ngInputSelectionStoryComponent} from "../d3ng-input-selection-story/d3ng-input-selection-story.component";

@Component({
  selector: 'd3ng-stories',
  templateUrl: './d3ng-stories.component.html',
  styleUrls: ['./d3ng-stories.component.css']
})
export class D3ngStoriesComponent implements OnInit {

  static stories = [
    {
      path: "selection-group",
      title: "Simple Selection Group",
      subtitle: "Multiple charts show and synchronize selections.",
      component: D3ngSelectionGroupStoryComponent
    },
    {
      path: "input-selection",
      title: "Input from Selection Group",
      subtitle: "Chart input from the selection of another chart or group.",
      component: D3ngInputSelectionStoryComponent
    }
  ];

  mstories = D3ngStoriesComponent.stories;

  constructor() { }

  ngOnInit() {
  }

}
