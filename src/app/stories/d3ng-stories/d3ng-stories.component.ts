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
      id: "A",
      path: "selection-group",
      title: "Selection Group",
      subtitle: "Multiple charts share selections.",
      component: D3ngSelectionGroupStoryComponent
    },
    {
      id: "B",
      path: "overlapping-groups",
      title: "Overlapping groups",
      subtitle: "A chart within multiple groups.",
      component: D3ngInputSelectionStoryComponent
    },
    {
      id: "C",
      path: "input-selection",
      title: "Input from a Group",
      subtitle: "Chart input from the selection of a group.",
      component: D3ngInputSelectionStoryComponent
    },
    {
      id: "D",
      path: "hierarchy",
      title: "Hierarchies within Groups",
      subtitle: "Grouped charts with data on different levels.",
      component: D3ngInputSelectionStoryComponent
    },
    {
      id: "BC",
      path: "comparison",
      title: "Comparisons",
      subtitle: "Use groups and input to compare data.",
      component: D3ngInputSelectionStoryComponent
    }
  ];

  mstories = D3ngStoriesComponent.stories;

  constructor() { }

  ngOnInit() {
  }

}
