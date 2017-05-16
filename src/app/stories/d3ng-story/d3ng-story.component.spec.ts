import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ngStoryComponent } from './d3ng-story.component';

describe('D3ngStoryComponent', () => {
  let component: D3ngStoryComponent;
  let fixture: ComponentFixture<D3ngStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3ngStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3ngStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
