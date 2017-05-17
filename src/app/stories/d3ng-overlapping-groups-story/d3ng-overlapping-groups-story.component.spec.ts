import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ngOverlappingGroupsStoryComponent } from './d3ng-overlapping-groups-story.component';

describe('D3ngOverlappingGroupsStoryComponent', () => {
  let component: D3ngOverlappingGroupsStoryComponent;
  let fixture: ComponentFixture<D3ngOverlappingGroupsStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3ngOverlappingGroupsStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3ngOverlappingGroupsStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
