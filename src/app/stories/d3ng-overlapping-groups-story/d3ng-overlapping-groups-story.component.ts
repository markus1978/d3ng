import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'd3ng-overlapping-groups-story',
  templateUrl: './d3ng-overlapping-groups-story.component.html',
  styleUrls: ['./d3ng-overlapping-groups-story.component.css']
})
export class D3ngOverlappingGroupsStoryComponent {

  constructor() { }

  data = [
    { a: 1, b: 1, c: 2 },
    { a: 1, b: 2, c: 1 },
    { a: 2, b: 1, c: 2 },
    { a: 2, b: 2, c: 1 },
  ]

  dimensions = [ 'a', 'b', 'c' ]
}
