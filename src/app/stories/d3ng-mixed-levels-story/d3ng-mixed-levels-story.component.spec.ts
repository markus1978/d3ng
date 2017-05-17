import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ngMixedLevelsStoryComponent } from './d3ng-mixed-levels-story.component';

describe('D3ngMixedLevelsStoryComponent', () => {
  let component: D3ngMixedLevelsStoryComponent;
  let fixture: ComponentFixture<D3ngMixedLevelsStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3ngMixedLevelsStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3ngMixedLevelsStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
