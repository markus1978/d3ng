import {AfterViewInit, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import * as d3 from "d3";

export class D3ngSelectionItem {
  group = 0;
  direct: boolean;
  selected: Array<any> = [];
}

export class D3ngSelection  {
  public items: Array<D3ngSelectionItem> = [];

  private directSelectionColors = D3ngChart.selectionColors.map(e => e.direct);
  private indirectSelectionColors = D3ngChart.selectionColors.map(e => e.indirect);

  public getSelection(group: number, direct: boolean, create = false): D3ngSelectionItem {
    const selection = this.items.find(s => s.group == group && s.direct == direct);
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

  public getSelected(group: number, direct: boolean, create = false): Array<any> {
    const selection = this.getSelection(group, direct, create);
    if (selection) {
      return selection.selected;
    } else {
      return [];
    }
  }

  public selectionColor(dataPoint: any, predicate?: (selected: any[], dataPoint: any) => boolean): string {
    if (!predicate) {
      predicate = (selected, dataPoint) => selected.indexOf(dataPoint) != -1;
    }
    let color = "black";
    this.items.forEach(item => {
      if (predicate(item.selected, dataPoint)) {
        if (item.direct) {
          color = D3ngChart.selectionColors[item.group].direct;
        } else {
          if (this.directSelectionColors.indexOf(color) == -1) {
            const oldColor = this.indirectSelectionColors.indexOf(color);
            if (oldColor == -1) {
              color = D3ngChart.selectionColors[item.group].indirect;
            }
          }
        }
      }
    });
    return color;
  }

  public sortSelection(groups: number[]) {
    this.items.sort((a, b) => {
      const ag = groups.indexOf(a.group);
      const bg = groups.indexOf(b.group);
      return (ag > bg) ? 1 : ((ag < bg) ? -1 : 0);
    });
  }

  public isSelected(dataPoint: any, predicate?: (selected: any[], dataPoint: any) => boolean): boolean {
    if (!predicate) {
      predicate = (selected, dataPoint) => selected.indexOf(dataPoint) != -1;
    }
    return this.items.findIndex(item => predicate(item.selected, dataPoint)) != -1;
  }
}


export abstract class D3ngChart implements OnChanges, AfterViewInit {

  /**
   * The colors used to draw shapes and lines in charts and diagrams.
   */
  static colors: Array<string> = [
    "#ffcdd2", "#f8bbd0", "#e1bee7", "#d1c4e9", "#c5cae9", "#bbdefb", "#b3e5fc", "#b2ebf2", "#b2dfdb", "#c8e6c9",
    "#dcedc8", "#f0f4c3", "#fff9c4", "#ffecb3", "#ffe0b2", "#ffccbc", "#d7ccc8", "#f5f5f5", "#cfd8dc"
  ];
  /**
   * The colors used to draw highlighted shapes and lines in charts and diagrams.
   */
  static highlighColors: Array<string> = [
    "#e53935", "#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#039be5", "#00acc1", "#00897b", "#43a047",
    "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00", "#f4511e", "#6d4c41", "#757575", "#546e7a"
  ];

  /**
   * Colors supposed to use for selections, both direct and indirect. Index determines selection group.
   */
  static selectionColors = [
    {
      direct: "#9E2622",
      indirect: "#bd7766"
    },
    {
      direct: "#005A9C",
      indirect: "#6a83a6"
    },
    {
      direct: "#dec057",
      indirect: "#ab9978"
    },
    {
      direct: "#69947d",
      indirect: "#006C45"
    },
  ];

  /**
   * The key used to determine the label of `data` nodes.
   */
  @Input() labelKey = "label";

  /**
   * The key used to determine the type of a `source` data node.
   */
  @Input() typeKey = "type";

  /**
   * The key used to determine the children of a `source` data node.
   */
  @Input() childKey = "children";

  /**
   * The set of data points that this chart represents. Can either be set
   * manually, or inderectly via `source` and `pattern`.
   */
  @Input() data: Array<any>;

  /**
   * Number of the current selection group. Selections for each groupd
   * are highlighted with different colors.
   */
  @Input() currentSelectionGroup = 0;
  private currentSelection: D3ngSelection = new D3ngSelection();

  /**
   * The current selection. (Only based on the current selection group).
   * @type {Array}
   */
  @Input('selected') set selected(value: Array<any>) {
    this.onIndirectSelectionChanged(value, this.currentSelectionGroup);
  };
  @Output() selectedChange = new EventEmitter<Array<any>>();

  @Input() customLabel: Function = null;

  @Input() multiselect = false;

  public groupOrder = [0, 1, 2, 3];

  /**
   * Allows clients to set a direct selection, before the chart has any data. Will be removed and set once data is set.
   * Its a hack, handle with care.
   * @type {any}
   */
  public preDirectSelection: any[] = null;

  public selectionFilter: (any) => boolean = null;

  private _isDrawSelection = true;

  @HostListener('contextmenu') onRightClick() {
    if (this.multiselect) {
      this.setDirectSelection([]);
    }
  };

  @Input() set isDrawSelection(value: boolean) {
    this._isDrawSelection = value;
    this.redraw();
  }
  get isDrawSelection(): boolean {
    return this._isDrawSelection;
  }

  /**
   * Calculates a set of representatives for an original data point. The idea is that a parent or child data point
   * in the data set can represent data points that are not within the data set.
   * @param original
   * @returns {any}
   */
  private findRepresentative(original: any): Array<any> {
    if (this.data.indexOf(original) !== -1) {
      return [original];
    } else {
      // original parents first
      let originalParent = this.getParent(original);
      while (originalParent) {
        if (this.data.indexOf(originalParent) !== -1) {
          return [originalParent];
        }
        originalParent = this.getParent(originalParent);
      }

      // data parents now
      const childRepresentatives = [];
      this.data.forEach(data => {
        let representativeParent = this.getParent(data);
        while (representativeParent) {
          if (representativeParent == original && childRepresentatives.indexOf(data) == -1) {
            childRepresentatives.push(data);
          }

          // This is not a good idea, since it is just a solution for a specific case.
          // The following will cause a "flat" selection. The element is only represented if the first parent of
          // the required type is selected.
          if (this.getType(representativeParent) != this.getType(data) && this.getType(representativeParent) == this.getType(original)) {
            break;
          }

          representativeParent = this.getParent(representativeParent);
        }
      });

      return childRepresentatives;
    }
  }

  public onIndirectSelectionChanged(selected: Array<any>, group: number) {
    this.updateSelection(selected, group, false);
  }

  private computeSelectedRepresentatives(selected: Array<any>): Array<any> {
    const representatives = [];
    selected.filter(s => s).forEach(s => {
      this.findRepresentative(s).forEach(r => {
        representatives.push(r);
      });
    });
    return representatives;
  }

  private updateSelection(selected: Array<any>, group: number, direct: boolean) {
    if (!selected) {
      selected = [];
    }

    const selection = this.currentSelection.getSelection(group, direct, true);

    selection.selected = this.computeSelectedRepresentatives(selected);

    this.currentSelection.sortSelection(this.groupOrder);
    if (this._isDrawSelection) {
      this.drawSelection(this.currentSelection);
    }
  }

  public setDirectSelection(selected: Array<any>) {
    const originalSelected = selected;
    if (this.selectionFilter) {
      selected = selected.filter(this.selectionFilter);
    }

    if (this.multiselect && originalSelected.length != 0) {
      const currentDirectSelection = this.currentSelection.getSelection(this.currentSelectionGroup, true);
      if (currentDirectSelection) {
        if (selected.length == 1 && currentDirectSelection.selected.lastIndexOf(selected[0]) != -1) {
          const allSelected = currentDirectSelection.selected.slice(0);
          const index = allSelected.indexOf(selected[0]);
          allSelected.splice(index, 1);
          selected = allSelected;
        } else {
          const allSelected = currentDirectSelection.selected.slice(0);
          selected.forEach(s => allSelected.push(s));
          selected = allSelected;
        }
      }
    }
    this.updateSelection(selected, this.currentSelectionGroup, true);
    this.selectedChange.emit(selected);
  }

  protected drawSelection(selection: D3ngSelection): void {
    const selected = selection
      .getSelected(this.currentSelectionGroup, true)
      .concat(selection.getSelected(this.currentSelectionGroup, false));
    this.drawSelected(selected);
  }

  protected drawSelected(selected: Array<any>): void {
    throw new Error("drawSelected must be overridden, if drawSelection is not overridden.");
  }

  protected abstract clear(): void;
  protected abstract draw(): void;

  public redraw(): void {
    this.clear();
    this.draw();
    if (this._isDrawSelection) {
      this.drawSelection(this.currentSelection);
    }
  }

  protected onDataChanged() {
    this.clear();
    this.draw();

    if (this.preDirectSelection) {
      this.setDirectSelection(this.preDirectSelection);
      this.preDirectSelection = null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty("data")) {
      this.onDataChanged();
    }
  }

  public setData(data: Array<any>): void {
    this.data = data;
    this.onDataChanged();
  }

  /**
   * Return the label of a given data node. The label is
   * also used to compute node colors. The default implementation
   * uses `labelKey`.
   */
  public getLabel(node): string {
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
    let result: string = null;
    while (node) {
      const label = this.getLabel(node);
      result = (label ? label : "") + (result && label ? "." : "") + (result ? result : "");
      node = this.getParent(node);
    }
    return result;
  }

  /**
   * Returns the type of the given `source` data node.
   * The default implementation uses `typeKey`.
   */
  public getType(node): string {
    return node[this.typeKey];
  }

  /**
   * Returns the children of a `source` data node. The default implementation
   * assumes each node with children has the `childKey` with an array of
   * child data nodes. Returns empty array, if no children are found.
   */
  public getChildren(node): Array<any> {
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

  /**
   * Returns the description of the node, if available.
   * @param node
   * @returns {any}
   */
  public getDescription(node: Object): string {
    return node["description"];
  }

  public getDimensionLabel(dim: any): string {
    return dim;
  }

  /**
   * Helper function that adds a mouseover tooltip to d3 elements.
   * @param vis is a d3 selection with all the elements that a mouseover tooltip shall be applied to.
   * @parem label function that produces the tooltip texts from data objects. this.getQualifiedLabel is used as a default.
   */
  public appendTooltip(vis: any, label?: (any, number?) => string) {
    const body = d3.select('body');
    const bodyNode = body.node();
    if (!label) {
      label = (data) => this.getQualifiedLabel(data);
    }

    vis.on('mouseover', (data, index) => {
      body.select('.tooltip').remove();
      const text = label(data, index);

      if (text) {
        const mousePos = d3.mouse(bodyNode);
        body.append('div')
          .attr('class', 'tooltip')
          .style({
            left: (mousePos[0] + 20) + 'px',
            top: mousePos[1] + 'px',
            position: "absolute",
            'box-shadow': '0 1px 2px 0 #656565',
            'background-color': 'white',
            padding: '3px',
            'z-index': 5,
            'font-size': "10px",
            'max-width': "150px"
          })
          .html(label(data, index));
      }
    });

    vis.on('mousemove', function() {
      const mousePos = d3.mouse(bodyNode);
      body.select('.tooltip').style({
        left: (mousePos[0] + 20) + 'px',
        top: mousePos[1] + 'px'
      });
    });

    vis.on('mouseout', function() {
      body.select('.tooltip').remove();
    });
  }

  ngAfterViewInit(): void {
    this.redraw();
  }
}
