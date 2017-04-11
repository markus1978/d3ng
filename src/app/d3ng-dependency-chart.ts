import {EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";

declare var D3ngPatternParser: any;
import "./d3ng-pattern-parser";
import {D3ngChart} from "./d3ng-chart";

export abstract class D3ngDependencyChart extends D3ngChart {

  /**
   * The data object key that gives the numerical value.
   */
  @Input() valueKey:string = "value";

  /**
   * The data node key that gives an array of dependency objects.
   * Each dependency object has an id and a value (see `idKey` and
   * `valueKey`).
   */
  @Input() refKey: string = "dependencies";

  /**
   * The key used to identify or reference data objects.
   */
  @Input() idKey: string = "id";


  protected getValue(ref):Number {
    return ref[this.valueKey];
  }

  /**
   * Return the id of a given data node or dependency.
   */
  protected getId(node):string {
    return node[this.idKey];
}

  protected getDependencies(node):Array<any> {
    return node[this.refKey];
  }
}
