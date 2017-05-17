import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { D3ngComponentsModule } from '../components/d3ng-components.module';
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MdListModule, MdSidenavModule} from "@angular/material";
import {RouterModule, Routes} from "@angular/router";
import { D3ngStoriesComponent } from './d3ng-stories/d3ng-stories.component';
import { D3ngSelectionGroupStoryComponent } from './d3ng-selection-group-story/d3ng-selection-group-story.component';
import { D3ngInputSelectionStoryComponent } from './d3ng-input-selection-story/d3ng-input-selection-story.component';
import { D3ngStoryComponent } from './d3ng-story/d3ng-story.component';
import { D3ngOverlappingGroupsStoryComponent } from './d3ng-overlapping-groups-story/d3ng-overlapping-groups-story.component';
import { D3ngMixedLevelsStoryComponent } from './d3ng-mixed-levels-story/d3ng-mixed-levels-story.component';

export const storiesRouting: Routes = D3ngStoriesComponent.stories;

@NgModule({
  imports: [
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    MdListModule,
    MdSidenavModule,
    D3ngComponentsModule,
    RouterModule.forChild(storiesRouting),
  ],
  declarations: [
    D3ngStoriesComponent,
    D3ngSelectionGroupStoryComponent,
    D3ngInputSelectionStoryComponent,
    D3ngStoryComponent,
    D3ngOverlappingGroupsStoryComponent,
    D3ngMixedLevelsStoryComponent
  ],
  exports: [
    RouterModule,
    D3ngStoriesComponent,
  ],
  bootstrap: [D3ngStoriesComponent],
  providers: [],
  schemas: [ NO_ERRORS_SCHEMA ] // necessary for transclusion with new tag names

})
export class D3ngStoriesModule { }
