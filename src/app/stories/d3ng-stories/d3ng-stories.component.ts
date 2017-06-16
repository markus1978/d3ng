import {Component} from "@angular/core";
import {D3ngSelectionGroupStoryComponent} from "../d3ng-selection-group-story/d3ng-selection-group-story.component";
import {D3ngInputSelectionStoryComponent} from "../d3ng-input-selection-story/d3ng-input-selection-story.component";
import {D3ngOverlappingGroupsStoryComponent} from "../d3ng-overlapping-groups-story/d3ng-overlapping-groups-story.component";
import {D3ngMixedLevelsStoryComponent} from "../d3ng-mixed-levels-story/d3ng-mixed-levels-story.component";
import {D3ngComparisonStoryComponent} from "../d3ng-comparison-story/d3ng-comparison-story.component";
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'd3ng-stories',
  templateUrl: './d3ng-stories.component.html',
  styleUrls: ['./d3ng-stories.component.css']
})
export class D3ngStoriesComponent {

  static stories = [
    {
      id: "A",
      path: "selection-group",
      title: "Selection Group",
      subtitle: "Multiple charts share selections.",
      description:
        `Interactive selection in one chart is reflected in the selection of other charts.
        Charts that interact via selections form <i>selection groups</i>.`,
      component: D3ngSelectionGroupStoryComponent
    },
    {
      id: "B",
      path: "overlapping-groups",
      title: "Overlapping groups",
      subtitle: "A chart within multiple groups.",
      description:
        `Each selection group is associated with a color to distinguish selection groups and selections belonging to
         different groups.`,
      component: D3ngOverlappingGroupsStoryComponent
    },
    {
      id: "C",
      path: "mixed-levels",
      title: "Mixed Hierarchy Levels",
      subtitle: "Grouped charts with data on different levels.",
      description:
        `If data is hierarchical, charts might represent data on different hierarchy levels.
         In this case, a data point (parent) in one chart can represent multiple data points (children) in another chart.`,
      component: D3ngMixedLevelsStoryComponent
    },
    {
      id: "D",
      path: "input-selection",
      title: "Input from Selections",
      subtitle: "Chart input from the selection of a group.",
      description: `Often we want to use a chart or selection group to select the input data for other charts.`,
      component: D3ngInputSelectionStoryComponent
    },
    {
      id: "BD",
      path: "comparison",
      title: "Comparisons",
      subtitle: "Use groups and input to compare data.",
      description: `We can use the selections from two selection groups as input for different charts to compare data from two selections.`,
      component: D3ngComparisonStoryComponent
    }
  ];

  mstories = D3ngStoriesComponent.stories;

  config: any = null;

  constructor(private router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let state = router.routerState.root;
        let parent = null;
        while (state.firstChild) {
          parent = state;
          state = state.firstChild;
        }
        if (parent && parent.routeConfig && parent.routeConfig.path == "stories") {
          this.config = state.routeConfig;
          this.config.sourceBasePath = `/assets/story-sources/d3ng-${state.routeConfig.path}-story.component`;
        } else {
          this.config = null;
        }
      }
    });
  }
}
