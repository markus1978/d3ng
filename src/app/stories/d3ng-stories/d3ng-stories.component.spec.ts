import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {D3ngStoriesComponent} from "./d3ng-stories.component";

describe('D3ngStoriesComponent', () => {
  let component: D3ngStoriesComponent;
  let fixture: ComponentFixture<D3ngStoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3ngStoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3ngStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
