import {EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";

declare var D3ngPatternParser: any;
import "./d3ng-pattern-parser";
import {D3ngChart} from "./d3ng-chart";

export abstract class D3ngHierarchicalChart extends D3ngChart {

  /**
   * @param node to compute the value for
   * @returns {number} the value associated with the given node. Default is 1.
   */
  protected getValue(node: Object): Number {
    return 1;
  }

  public static computeHierarchyRoot(self: D3ngChart, data: Array<any>): Object {
    if (!data || data.length == 0) {
      return undefined;
    }

    const knownRoots = {};
    let root = null;

    const rootOf = dataPoint => {
      if (!knownRoots[dataPoint]) {
        var parent = self.getParent(dataPoint);
        if (parent) {
          knownRoots[dataPoint] = rootOf(parent)
        } else {
          if (root == null) {
            root = dataPoint;
            knownRoots[dataPoint] = root;
          } else {
            throw new Error("Hierarchy data has more than one root.");
          }
        }
      }
      return knownRoots[dataPoint];
    }

    data.forEach(dataPoint => rootOf(dataPoint));

    return root;
  }

  protected computeHierarchyRoot(): Object {
    return D3ngHierarchicalChart.computeHierarchyRoot(this, this.data);
  }

  public static createUniDirectionalHierarchyView(self: D3ngChart, node:any): any {
    return D3ngHierarchicalChart.createHierarchyView(self, node, null, null);
  }

  /**
   * Creates a tree structure that mirrors the given tree structure. This "view" is to be used in cases where D3 is manipulating
   * the data it visualizes. Instead of changing the original data, it is ought to be preserved. This allows multiple
   * components to use the same data without interfering with each other.
   * @param self The chart component (used to access children of nodes).
   * @param node The node to be mirrored.
   * @param mapping The backward mapping that returns the mirror node for a given node.
   * @parem id Function that gives a unique id for a node.
   * @returns The mirror/view node. It contains a reference to the original node using the key 'original'.
   */
  public static createHierarchyView(self: D3ngChart, node:any, mapping:any, id: (any)=>any): any {
    const result:any = {};
    result.original = node;
    result.children = [];
    if (mapping && id) {
      const nodeId = id(node);
      result.key = nodeId;
      mapping[nodeId] = result;
    }
    self.getChildren(node).forEach(child => {
      const viewChild = D3ngHierarchicalChart.createHierarchyView(self, child, mapping, id);
      result.children.push(viewChild);
      viewChild.parent = result;
    });

    return result;
  }
}
