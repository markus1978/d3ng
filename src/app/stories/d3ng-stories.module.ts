import { NgModule } from '@angular/core';
import { D3ngComponentsModule } from '../components/d3ng-components.module';
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MdListModule, MdSidenavModule} from "@angular/material";
import {RouterModule, Routes} from "@angular/router";
import { D3ngStoriesComponent } from './d3ng-stories/d3ng-stories.component';
import { D3ngSelectionGroupStoryComponent } from './d3ng-selection-group-story/d3ng-selection-group-story.component';
import { D3ngInputSelectionStoryComponent } from './d3ng-input-selection-story/d3ng-input-selection-story.component';

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
    D3ngInputSelectionStoryComponent
  ],
  exports: [
    RouterModule,
    D3ngStoriesComponent,
  ],
  bootstrap: [D3ngStoriesComponent],
  providers: []
})
export class D3ngStoriesModule { }
