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
