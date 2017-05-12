import {EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";

declare let D3ngPatternParser: any;
import "./d3ng-pattern-parser";
import {D3ngSourceDirective} from "./d3ng-source.directive";

export abstract class D3ngChart implements OnChanges {

  /**
   * The colors used to draw shapes and lines in charts and diagrams.
   */
  static colors: Array<string> = [  "#ffcdd2", "#f8bbd0", "#e1bee7", "#d1c4e9", "#c5cae9", "#bbdefb", "#b3e5fc", "#b2ebf2", "#b2dfdb", "#c8e6c9", "#dcedc8", "#f0f4c3", "#fff9c4", "#ffecb3", "#ffe0b2", "#ffccbc", "#d7ccc8", "#f5f5f5", "#cfd8dc" ];
  /**
   * The colors used to draw highlighted shapes and lines in charts and diagrams.
   */
  static highlighColors: Array<string> = [ "#e53935", "#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#039be5", "#00acc1", "#00897b", "#43a047", "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00", "#f4511e", "#6d4c41", "#757575", "#546e7a" ];

  /**
   * The key used to determine the label of `data` nodes.
   */
  @Input() labelKey: string = "label";

  /**
   * The key used to determine the type of a `source` data node.
   */
  @Input() typeKey: string = "type";

  /**
   * The key used to determine the children of a `source` data node.
   */
  @Input() childKey: string = "children";

  /**
   * The set of data points that this chart represents. Can either be set
   * manually, or inderectly via `source` and `pattern`.
   */
  @Input() data: Array<any>;

  /**
   * The current selection.
   * @type {Array}
   */
  @Input() protected selected: Array<any> = [];
  @Output() protected selectedChange = new EventEmitter<Array<any>>();

  @Input() private customLabel: Function = null;

  /**
   * Calculates a set of representatives for an original data point. The idea is that a parent or child data point
   * in the data set can represent data points that are not within the data set.
   * @param original
   * @returns {any}
   */
  private findRepresentative(original: any): Array<any> {
    if (this.data.indexOf(original) != -1) {
      return [original];
    } else {
      // original parents first
      let parent = this.getParent(original);
      while (parent) {
        if (this.data.indexOf(parent) != -1) {
          return [parent];
        }
        parent = this.getParent(parent);
      }

      // data parents now
      const childRepresentatives = [];
      this.data.forEach(data=>{
        let parent = this.getParent(data);
        while (parent) {
          if(parent == original && childRepresentatives.indexOf(data) == -1) {
            childRepresentatives.push(data);
          }

          // This is not a good idea, since it is just a solution for a specific case.
          // The following will cause a "flat" selection. The element is only represented if the first parent of the required type is selected.
          if (this.getType(parent) != this.getType(data) && this.getType(parent) == this.getType(original)) {
            break;
          }

          parent = this.getParent(parent);
        }
      });

      return childRepresentatives;
    }
  }

  private onSelectedChanged(selected: Array<any>):void {
    if (selected) {
      const representatives = [];
      selected.forEach(s=>{
        this.findRepresentative(s).forEach(r=>{
          representatives.push(r);
        })
      });
      this.drawSelected(representatives);
    }
  }

  protected abstract drawSelected(selected: Array<any>): void;

  protected abstract clear():void;
  protected abstract draw():void;

  public redraw():void {
    this.clear();
    this.draw();
  }

  protected onDataChanged() {
    this.clear();
    this.draw();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty("selected")) {
      this.onSelectedChanged(this.selected);
    }
    if (changes.hasOwnProperty("data")) {
      this.onDataChanged();
    }
  }

  public setData(data:Array<any>):void {
    this.data = data;
    this.onDataChanged();
  }

  /**
   * Return the label of a given data node. The label is
   * also used to compute node colors. The default implementation
   * uses `labelKey`.
   */
  public getLabel(node):string {
    if (this.customLabel) {
      return this.customLabel(node);
    } else {
      if (node) {
        return node[this.labelKey];
      } else {
        return undefined;
      }
    }
  }

  public getQualifiedLabel(node): string {
    var result: string = null;
    while(node) {
      var label = this.getLabel(node);
      result = (label ? label : "") + (result && label ? "." : "") + (result ? result : "");
      node = this.getParent(node);
    }
    return result;
  }

  /**
   * Returns the type of the given `source` data node.
   * The default implementation uses `typeKey`.
   */
  public getType(node):string {
    return node[this.typeKey];
  }

  /**
   * Returns the children of a `source` data node. The default implementation
   * assumes each node with children has the `childKey` with an array of
   * child data nodes. Returns empty array, if no children are found.
   */
  public getChildren(node):Array<any> {
    const result = node[this.childKey];
    if (result) {
      return result;
    } else {
      return [];
    }
  }

  /**
   * Retrieves the parent node for a given node. The default implementation uses "parent" as key.
   * @param node
   * @returns {any} null if there is no parent.
   */
  public getParent(node: Object): Object {
    return node["parent"];
  }

}
