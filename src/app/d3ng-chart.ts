import {EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";

declare var D3ngPatternParser: any;
import "./d3ng-pattern-parser";

interface LimitTerm extends  PatternTerm {
  isTypeNegated: boolean;
}

interface PatternTerm {
  type:string;
  isNegated:boolean;
  limit: LimitTerm;
}

export abstract class D3ngChart implements OnChanges, OnInit {

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

  protected abstract onSelectedChanged(selected: Array<any>):void;

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
  protected getLabel(node):string {
    if (this.customLabel) {
      return this.customLabel(node);
    } else {
      return node[this.labelKey];
    }
  }

  /**
   * Returns the type of the given `source` data node.
   * The default implementation uses `typeKey`.
   */
  protected getType(node):string {
    return node[this.typeKey];
  }

  /**
   * Returns the children of a `source` data node. The default implementation
   * assumes each node with children has the `childKey` with an array of
   * child data nodes. Returns empty array, if no children are found.
   */
  protected getChildren(node):Array<any> {
    const result = node[this.childKey];
    if (result) {
      return result;
    } else {
      return [];
    }
  }

  /**
   * Updates the `data` property by applying the current `parsedPattern` to
   * `source`.
   */
  protected onSourceChanged():void {
    if (this.source && this.parsedPattern) {
      this.ensureParents();
      const self = this;
      const result = [];

      const typeMatches = function(d, patternTerm) {
        if (patternTerm.isTypeNegated) {
          return !(patternTerm.type == "." || self.getType(d) == patternTerm.type);
        } else {
          return patternTerm.type == "." || self.getType(d) == patternTerm.type;
        }
      }

      const visit = function(d, index) {
        const patternTerm = self.parsedPattern[index];
        const isLast = index + 1 == self.parsedPattern.length;
        if (typeMatches(d, patternTerm)) {
          const children = self.getChildren(d);
          children.forEach(function(c) { visit(c, index)})
          if (isLast) {
            if (patternTerm.limit) {
              const limitMatches = !children.every(function(c) { return !typeMatches(c,patternTerm.limit); });
              if (patternTerm.limit.isNegated && !limitMatches) {
                result.push(d);
              } else if (!patternTerm.limit.isNegated && limitMatches) {
                result.push(d);
              }
            } else {
              result.push(d);
            }
          } else {
            self.getChildren(d).forEach(function(c) { visit(c, index+1); })
          }
        }
      };
      visit(this.source, 0);

      this.data = result;
      this.onDataChanged();
    }
  }

  private ensureParents():void {
    const self = this;
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
