import {EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";

export class D3ngSelectionItem {
  group:number = 0;
  direct: boolean;
  selected: Array<any> = [];
}

export class D3ngSelection  {
  public items: Array<D3ngSelectionItem> = [];
  public getSelection(group:number, direct:boolean, create = false):D3ngSelectionItem {
    const selection = this.items.find(s=>s.group==group && s.direct==direct);
    if (selection) {
      return selection;
    } else {
      if (create) {
        const newSelection = new D3ngSelectionItem();
        newSelection.group = group;
        newSelection.direct = direct;
        this.items.push(newSelection);
        return newSelection;
      } else {
        return null;
      }
    }
  }

  public getSelected(group:number, direct:boolean, create = false):Array<any> {
    const selection = this.getSelection(group, direct, create);
    if (selection) {
      return selection.selected;
    } else {
      return [];
    }
  }
}


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
   * Colors supposed to use for selections, both direct and indirect. Index determines selection group.
   */
  static selectionColors = [
    {
      direct: "#9E2622",
      indirect: "#CC8574"
    },
    {
      direct: "#005A9C",
      indirect: "#B3C1DF"
    },
    {
      direct: "#E8DEC0",
      indirect: "#D4C48E"
    },
    {
      direct: "#76A58E",
      indirect: "#006C45"
    },
  ]

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
   * Number of the current selection group. Selections for each groupd
   * are highlighted with different colors.
   */
  @Input() currentSelectionGroup: number = 0;
  private currentSelection: D3ngSelection = new D3ngSelection();

  /**
   * The current selection. (Only based on the current selection group).
   * @type {Array}
   */
  @Input('selected') set selected(value: Array<any>) {
    this.onIndirectSelectionChanged(value, this.currentSelectionGroup);
  };
  @Output() selectedChange = new EventEmitter<Array<any>>();

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

  public onIndirectSelectionChanged(selected:Array<any>, group:number) {
    this.updateSelection(selected, group, false);
  }

  private computeSelectedRepresentatives(selected:Array<any>):Array<any> {
    const representatives = [];
    selected.forEach(s=>{
      this.findRepresentative(s).forEach(r=>{
        representatives.push(r);
      })
    });
    return representatives;
  }

  private updateSelection(selected: Array<any>, group:number, direct: boolean) {
    if (!selected) {
      selected = [];
    }

    const selection = this.currentSelection.getSelection(group, direct, true);

    selection.selected = this.computeSelectedRepresentatives(selected);

    this.drawSelection(this.currentSelection);
  }

  protected setDirectSelection(selected: Array<any>) {
    this.updateSelection(selected, this.currentSelectionGroup, true);
    this.selectedChange.emit(selected);
  }

  protected drawSelection(selection: D3ngSelection): void {
    const selected = selection.getSelected(this.currentSelectionGroup, true).concat(selection.getSelected(this.currentSelectionGroup, false));
    this.drawSelected(selected);
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
