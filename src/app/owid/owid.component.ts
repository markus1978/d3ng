import {Component, OnInit, ViewChild} from '@angular/core';
import {Http, Response} from "@angular/http";
import {D3ngListComponent} from "../components/d3ng-list.component";
import {D3ngParallelCoordinatesComponent} from "../components/d3ng-parallel-coordinates.component";
import {D3ngChart} from "../components/d3ng-chart";

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

  @ViewChild('meta') metaDataListElement: D3ngChart;
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
  }

}
