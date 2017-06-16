import {Component} from "@angular/core";
import {D3ngStoryBase} from "../d3ng-story-base";

@Component({
  selector: 'd3ng-input-selection-story',
  templateUrl: './d3ng-input-selection-story.component.html',
  styleUrls: ['./d3ng-input-selection-story.component.css']
})
export class D3ngInputSelectionStoryComponent extends D3ngStoryBase {
  selection = []; // without this initialization the child chart is not drawn initially, since it only updates on changing source data

  selectedChanged(event:any) {
    console.log(event);
  }
}

