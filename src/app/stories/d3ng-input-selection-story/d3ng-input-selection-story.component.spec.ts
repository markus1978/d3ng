import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ngInputSelectionStoryComponent } from './d3ng-input-selection-story.component';

describe('D3ngInputSelectionStoryComponent', () => {
  let component: D3ngInputSelectionStoryComponent;
  let fixture: ComponentFixture<D3ngInputSelectionStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3ngInputSelectionStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3ngInputSelectionStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
