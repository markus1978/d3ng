import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {MdButtonToggleChange} from "@angular/material";

@Component({
  selector: 'd3ng-group-selection',
  template: `    
    <md-button-toggle-group multiple>
      <md-button-toggle *ngFor="let group of groups" 
                        [value]="group" 
                        [checked]="values.indexOf(group) != -1"
                        (change)="onChange($event)"
                        [class]="'group-btn-'+group">
        &nbsp;
      </md-button-toggle>
    </md-button-toggle-group>
  `,
  styles: [
    ':host { display: block; }',
    'md-button-toggle-group { height: 15px; }',
    '.mat-button-toggle-checked { border: solid grey 1px; }',
    '.group-btn-0.mat-button-toggle-checked { background-color: #9E2622; }',
    '.group-btn-0:not(.mat-button-toggle-checked) {background-color: #CC8574; }',
    '.group-btn-1.mat-button-toggle-checked { background-color: #005A9C; }',
    '.group-btn-1:not(.mat-button-toggle-checked) {background-color: #B3C1DF; }',
    '.group-btn-2.mat-button-toggle-checked { background-color: #D4C48E; }',
    '.group-btn-2:not(.mat-button-toggle-checked) {background-color: #E8DEC0; }',
    '.group-btn-3.mat-button-toggle-checked { background-color: #006C45; }',
    '.group-btn-3:not(.mat-button-toggle-checked) {background-color: #76A58E; }',
  ]
})
export class D3ngGroupSelectionComponent implements OnInit, OnChanges {

  @Input() multi = false;
  @Input() allowEmpty = false;
  @Input() groups: number[] = [0,1,2,3];

  @Input()
  set value(value) {
    this.values = [value];
  }
  get value() {
    return this.values.length == 0 ? -1 : this.values[0];
  }
  @Output() valueChange = new EventEmitter<number>();

  @Input() values: number[] = [];
  @Output() valuesChange = new EventEmitter<number[]>();

  constructor() {}

  private onChange(event: MdButtonToggleChange) {
    if (event.source.checked) {
      if (!this.multi) {
        this.values = [];
      }
      this.values.push(event.value);
    } else {
      if (this.values.length == 1 && !this.allowEmpty) {
        event.source.checked = true;
      } else {
        this.values.splice(this.values.indexOf(event.value), 1);
      }
    }

    this.changed();
  }

  public ngOnInit() {
    if (!this.allowEmpty && this.values.length == 0) {
      this.value = this.values.push(this.groups[0]);
      this.changed();
    }
  }

  private changed() {
    this.valuesChange.emit(this.values);
    this.valueChange.emit(this.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty("groups")) {
      const toRemove = [];
      const values = Array.from(this.values);
      values.forEach(value => {
        if (this.groups.indexOf(value) == -1) {
          toRemove.push(value);
        }
      });
      if (toRemove.length > 0) {
        toRemove.forEach(value => {
          values.splice(values.indexOf(value), 1);
        });

        if (values.length == 0 && !this.allowEmpty) {
          values.push(this.groups[0]);
        }
        this.values = values;
        this.changed();
      }
    }
  }
}
