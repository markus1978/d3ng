import {
  Directive, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,
  ViewContainerRef
} from '@angular/core';
declare let D3ngPatternParser: any; import "./d3ng-pattern-parser";
import {D3ngChart} from "./d3ng-chart";

export interface PatternTerm {
  type:string;
  isNegated:boolean;
  isTypeNegated: boolean;
  notFlat: boolean;
  limit: PatternTerm;
}

@Directive({
  selector: '[d3ngSource]'
})
export class D3ngSourceDirective implements OnChanges, OnInit {

  private parsedPattern: Array<PatternTerm>;

  /**
   * The data source that this chart gets its data from. This is usually
   * the root for a tree of data.
   * This is a superset of the data that the chart actually represents.
   * Use `pattern` to choose which data nodes are shown in the chart.
   */
  @Input() source: Array<Object>;

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
  @Input() pattern: string = ".";

  /**
   * The key used to determine the type of a `source` data node.
   */
  @Input() typeKey: string = "type";

  /**
   * The key used to determine the children of a `source` data node.
   */
  @Input() childKey: string = "children";

  @Output() dataChange = new EventEmitter<Array<any>>();

  chart: D3ngChart;

  constructor(private _view: ViewContainerRef) {
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty("pattern")) {
      this.updatePattern();
    }
    if (changes.hasOwnProperty("source")) {
      this.onChanged();
    }
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
  protected onChanged():void {
    if (this.source && this.source.length > 0 && this.parsedPattern) {
      this.ensureParents();
      const results = [];

      this.source.forEach(sourceItem=>{
        if (sourceItem) {
          this.addMatches(sourceItem, results, 0, true);
        }
      });

      if (results.length > 0) {
        if (this.chart) {
          this.chart.setData(results);
        }
        this.dataChange.emit(results);
      }
    }
  }

  private ensureParents():void {
    const self = this;
    this.source.forEach(sourceItem=>{
      sourceItem["parent"] = null;
      function visit(d) {
        self.getChildren(d).forEach(function (c) {
          if (!c.parent) {
            c.parent = d;
            visit(c);
          }
        });
      }
      visit(sourceItem);
    });

  }

  private updatePattern():void {
    try {
      this.parsedPattern = D3ngPatternParser.parse(this.pattern);
      this.onChanged();
    } catch(e) {}
  }

  ngOnInit(): void {
    try {
      this.chart = (<any>this._view)._data.componentView.component;
    } catch (e) {

    }
    this.updatePattern();
  }

}
