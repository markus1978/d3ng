import {Component} from "@angular/core";
import {D3ngStoryBase} from "../d3ng-story-base";

@Component({
  selector: 'app-d3ng-comparison-story',
  templateUrl: './d3ng-comparison-story.component.html',
  styleUrls: ['./d3ng-comparison-story.component.css']
})
export class D3ngComparisonStoryComponent extends D3ngStoryBase {
  one = []; two = []; // without this initialization the child chart is not drawn initially, since it only updates on changing source data

  onSelectedChanged(event:any) {
    if (event.group == 0) {
      this.one = event.selected;
    } else {
      this.two = event.selected;
    }
  }
}
