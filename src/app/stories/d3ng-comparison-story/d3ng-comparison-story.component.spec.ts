import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ngComparisonStoryComponent } from './d3ng-comparison-story.component';

describe('D3ngComparisonStoryComponent', () => {
  let component: D3ngComparisonStoryComponent;
  let fixture: ComponentFixture<D3ngComparisonStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3ngComparisonStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3ngComparisonStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
