import {EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";

declare let D3ngPatternParser: any;
import "./d3ng-pattern-parser";

export interface PatternTerm {
  type:string;
  isNegated:boolean;
  isTypeNegated: boolean;
  notFlat: boolean;
  limit: PatternTerm;
}

export abstract class D3ngChart implements OnChanges, OnInit {

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

  private parsedPattern: Array<PatternTerm>;

  /**
   * The data source that this chart gets its data from. This is usually
   * the root for a tree of data.
   * This is a superset of the data that the chart actually represents.
   * Use `pattern` to choose which data nodes are shown in the chart.
   */
  @Input() protected source: Object;

  /**
   * The `pattern` is used for two things. First, it is used to select a
   * subset of data points from the data `source`. This subset of
   * data points is represented in this chart. Second, the pattern
   * influences the selection behavior for this chart.
   * The default pattern is a wildcard pattern that selects all nodes
   * from the `source` data.
   *
   * Syntax:
   * type_ref := ID|'.'
   * segment := '!'? type_ref ('!'? '[' '!'? type_ref ']')? '+'?
   * pattern := segment ('/' segment)*
   */
  @Input() protected pattern: string = ".";

  /**
   * The set of data points that this chart represents. Can either be set
   * manually, or inderectly via `source` and `pattern`.
   */
  @Input() protected data: Array<any>;

  /**
   * The current selection.
   * @type {Array}
   */
  @Input() protected selected: Array<any> = [];
  @Output() protected selectedChange = new EventEmitter<Array<any>>();

  @Input() private customLabel: Function = null;

  private addMatchingSelectedItem(selectedItem:any, list:Array<any>): boolean {
    for(let index = 0; index < this.parsedPattern.length; index++) {
      if (this.typeMatches(selectedItem, this.parsedPattern[index])) {
        return this.addMatches(selectedItem, list, index, false);
      }
    }
    return false;
  }

  private onSelectedChanged(selected: Array<any>):void {
    if (selected) {
      const indirect = [];
      selected.forEach(selectedItem => {
        // indicates that something within the content (including itself) matches the selected item
        const hasDownMatch = this.addMatchingSelectedItem(selectedItem, indirect);
        if (!hasDownMatch) {
          let e = selectedItem.parent;
          while(e) {
            if (this.addMatchingSelectedItem(e, indirect)) {
              break;
            } else {
              e = e.parent;
            }
          }
        }
      });

      this.drawSelected(indirect);
    }
  }

  protected abstract drawSelected(selected: Array<any>): void;

  protected abstract clear():void;
  protected abstract draw():void;

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
    if (changes.hasOwnProperty("pattern")) {
      this.updatePattern();
    }
    if (changes.hasOwnProperty("source")) {
      this.onSourceChanged();
    }
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

  private typeMatches(element:any, patternTerm:PatternTerm):boolean {
    if (patternTerm.isTypeNegated) {
      return !(patternTerm.type == "." || this.getType(element) == patternTerm.type);
    } else {
      return patternTerm.type == "." || this.getType(element) == patternTerm.type;
    }
  }

  private addMatches(element:any, results:Array<any>, index:number, findAll:boolean):boolean {
    const patternTerm = this.parsedPattern[index];
    const isLast = index + 1 == this.parsedPattern.length;
    let hasMatch = false;
    if (this.typeMatches(element, patternTerm)) {
      const children = this.getChildren(element);
      if (isLast) {
        if (patternTerm.limit) {
          const limitMatches = !children.every(c => !this.typeMatches(c,patternTerm.limit));
          if (patternTerm.limit.isNegated && !limitMatches) {
            hasMatch = true;
            results.push(element);
          } else if (!patternTerm.limit.isNegated && limitMatches) {
            hasMatch = true;
            results.push(element);
          }
        } else {
          hasMatch = true;
          results.push(element);
        }
      } else {
        this.getChildren(element).forEach(c => {
          if (this.addMatches(c, results, index+1, findAll)) {
            hasMatch = true;
          }
        })
      }

      if (!hasMatch || findAll || patternTerm.notFlat) {
        children.forEach(c => {
          if (this.addMatches(c, results, index, findAll)) {
            hasMatch = true;
          };
        });
      }

      return hasMatch;
    }
  }

  /**
   * Updates the `data` property by applying the current `parsedPattern` to
   * `source`.
   */
  protected onSourceChanged():void {
    if (this.source && this.parsedPattern) {
      this.ensureParents();
      const results = [];

      this.addMatches(this.source, results, 0, true);

      this.data = results;
      this.onDataChanged();
    }
  }

  private ensureParents():void {
    const self = this;
    self.source["parent"] = null;
    function visit(d) {
      self.getChildren(d).forEach(function (c) {
        if (!c.parent) {
          c.parent = d;
          visit(c);
        }
      });
    }
    visit(self.source);
  }

  private updatePattern():void {
    this.parsedPattern = D3ngPatternParser.parse(this.pattern);
  }

  ngOnInit(): void {
    this.updatePattern();
  }
}
