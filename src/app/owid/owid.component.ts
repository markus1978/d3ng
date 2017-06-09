import {Component, OnInit, ViewChild} from '@angular/core';
import {Http, Response} from "@angular/http";
import {D3ngParallelCoordinatesComponent} from "../components/d3ng-parallel-coordinates.component";
import {D3ngCollapsibleIndentedTreeComponent} from "../components/d3ng-collapsible-indented-tree.component";
import * as d3 from "d3";

@Component({
  selector: 'app-owid',
  templateUrl: './owid.component.html',
  styleUrls: ['simplegrid.css', './owid.component.css']
})
export class OwidComponent implements OnInit {

  private db: {
    data: [{
      code: string,
      label: string,
      data: [{
        key: string,
        value: any
      }]
    }],
    meta: any[]
  } = null;

  private metaDataList: any[] = [];
  private dimensions = [
    "Government spending (%GDP)",
    "Literacy rate",
    "Per capita energy use- World Bank",
    "Population Growth Rate",
    "Gini Index – World Bank",
    "Population Density"
  ];
  private data: any[] = [];
  private metaByKey = {};

  @ViewChild('meta') metaDataListElement: D3ngCollapsibleIndentedTreeComponent;
  @ViewChild('pc') pc: D3ngParallelCoordinatesComponent;

  constructor(http: Http) {
    http.get('/assets/owid-2017.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.setDB(res);
      });
  }

  private dimensionsFromSelection(selection: any[]): string[] {
    return selection.map(d => d.key);
}

  private setDB(db: any): void {
    this.db = db;

    // restructure data
    db.data.forEach(data => {
      data.data.forEach(value => {
        data[value.key] = value.value;
      })
      data.data = undefined;
    });
    this.data = db.data;

    // filter and flatten meta data directory
    const filter = (node, pred: (any) => boolean) => {
      if (node.children) {
        node.children = node.children.filter(child => filter(child, pred));
        return node.children.length > 0;
      } else {
        return pred(node);
      }
    };
    this.db.meta = this.db.meta.filter(m => filter(m, node => (node.countries > 100 && node.number)));

    // keep meta dict
    const visit = (node) => {
      if (node.children) {
        node.children.forEach(child => visit(child));
      }

      if (node.key) {
        this.metaByKey[node.key] = node;
      }
    };
    this.db.meta.forEach(meta => visit(meta));

    this.metaDataList = [{
      label: "OWID Data",
      children: this.db.meta
    }];
  }

  ngOnInit() {
    this.metaDataListElement.customLabel = (item) => {
      if (item.countries) {
        return "(" + item.countries + ") " + item.label;
      } else {
        return item.label;
      }
    };

    this.metaDataListElement.customizeEntrySpan = (span) => {
      span = span.filter(d => d.source);
      span.append('span').text(' (');
      span.append('a')
        .attr('href', d => d.source)
        .attr('target', 'new')
        .text('source');
      span.append('span').text(')');
    };

    this.pc.getDimensionLabel = (dim) => {
      const meta = this.metaByKey[dim];
      if (meta) {
        return this.trunc(meta.key, 8);
      } else {
        return this.trunc(dim, 8);
      }
    };

    this.pc.appendAxis = (axis) => {
      axis.selectAll('.axisTitle').attr("y", -15);
      axis.append('title').text(d => {
        const meta = this.metaByKey[d];
        if (meta) {
          return meta.label + ": " + meta.description;
        } else {
         return d;
        }
      });

      const addScaleArrow = (direction) => {
        axis.filter(d => this.metaByKey[d]).append('svg:text')
          .text(direction > 0 ? '>' : '<')
          .attr("text-anchor", "middle")
          .attr("y", -4)
          .attr("x", 5*direction)
          .attr("style", "font-size: 11px; cursor: pointer;")
          .on('click', (d) => {
            if (!this.metaByKey[d].scale) {
              this.metaByKey[d].scale = 1;
            }
            this.metaByKey[d].scale = direction > 0 ? this.metaByKey[d].scale * 1.2 : this.metaByKey[d].scale / 1.2;
            this.pc.redraw();
          });
      };
      addScaleArrow(1);
      addScaleArrow(-1);
    };

    this.pc.getScaleForDimension = (dim) => {
      const meta = this.metaByKey[dim];
      if (meta) {
        var scale = this.metaByKey[dim].scale;
        if (!scale) {
          scale = 1;
        }
        return d3.scale.pow().exponent(scale);
      }
      return d3.scale.linear();
    }
  }

  private trunc(str: string, n: number): string {
    return (str.length > n) ? str.substr(0, n-1) + '..' : str;
  }

}
