import { Component, OnInit } from '@angular/core';
import {D3ngSelectionGroupStoryComponent} from "../d3ng-selection-group-story/d3ng-selection-group-story.component";
import {D3ngInputSelectionStoryComponent} from "../d3ng-input-selection-story/d3ng-input-selection-story.component";
import {D3ngOverlappingGroupsStoryComponent} from "../d3ng-overlapping-groups-story/d3ng-overlapping-groups-story.component";
import {D3ngMixedLevelsStoryComponent} from "../d3ng-mixed-levels-story/d3ng-mixed-levels-story.component";

export class D3ngStoriesDataUtils {
  public static createDummyData(t, x, y, size, childrenFunction?:(x,y)=>any) {
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
      component: D3ngOverlappingGroupsStoryComponent
    },
    {
      id: "C",
      path: "mixed-levels",
      title: "Mixed Hierarchy Levels",
      subtitle: "Grouped charts with data on different levels.",
      component: D3ngMixedLevelsStoryComponent
    },
    {
      id: "D",
      path: "input-selection",
      title: "Child Groups",
      subtitle: "Chart input from the selection of a group.",
      component: D3ngInputSelectionStoryComponent
    },
    {
      id: "BD",
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
