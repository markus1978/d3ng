import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'd3ng-selection-group-story',
  templateUrl: './d3ng-selection-group-story.component.html',
  styleUrls: ['./d3ng-selection-group-story.component.css']
})
export class D3ngSelectionGroupStoryComponent implements OnInit {

  constructor() { }

  data = [
    { a: 1, b: 1, c: 2 },
    { a: 1, b: 2, c: 1 },
    { a: 2, b: 1, c: 2 },
    { a: 2, b: 2, c: 1 },
  ]

  dimensions = [ 'a', 'b', 'c' ]

  ngOnInit() {
  }

}
