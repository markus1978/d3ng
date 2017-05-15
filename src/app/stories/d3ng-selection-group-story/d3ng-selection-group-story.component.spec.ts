import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ngSelectionGroupStoryComponent } from './d3ng-selection-group-story.component';

describe('D3ngSelectionGroupStoryComponent', () => {
  let component: D3ngSelectionGroupStoryComponent;
  let fixture: ComponentFixture<D3ngSelectionGroupStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3ngSelectionGroupStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3ngSelectionGroupStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
