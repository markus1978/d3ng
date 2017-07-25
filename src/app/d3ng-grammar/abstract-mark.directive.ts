import {ChartElement} from "./chart.directive";
import {EventEmitter, Input, Output} from "@angular/core";
import {D3ngSelection} from "../../lib/d3ng-chart";

export enum SelectMethods { click, multiClick, brush, shiftHover, none }

export abstract class AbstractMarkDirective extends ChartElement {

  private selection = [];
  @Output() selectionChange = new EventEmitter();

  private _selectMethod = SelectMethods.none;
  @Input() set select(value) {
    if (typeof value === 'string') {
      this._selectMethod = SelectMethods[value];
    } else {
      this._selectMethod = value;
    }
  };

  /**
   * @param elements A d3 selection of mark elements.
   * @parem toData Translates between data bound to d3 elements and user data. Default is a => [a].
   */
  protected installHandlers(elements, toData?: (any) => [any]): void {
    if (!toData) {
      toData = (a) => [a];
    }

    if (this._selectMethod === SelectMethods.click) {
      elements.on('click', d3Datum => {
        const data = toData(d3Datum);
        this.selection = data;
        this.selectionChange.emit(this.selection);
      });
    } else if (this._selectMethod === SelectMethods.multiClick) {
      elements.on('click', d3Datum => {
        const data = toData(d3Datum);
        data.forEach(datum => {
          const index = this.selection.indexOf(datum);
          if (index != -1) {
            this.selection = this.selection.splice(index, 1);
          } else {
            this.selection.push(datum);
          }
        });
        this.selectionChange.emit(this.selection);
      });
    } else if (this._selectMethod === SelectMethods.none) {
      // nothing
    } else {
      console.log(`WARNING: select method ${SelectMethods[this._selectMethod]} is not supported.`);
    }
  }

  abstract drawSelection(selection: D3ngSelection): void;
}
