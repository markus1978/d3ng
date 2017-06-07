import {Component, OnInit, ViewChild} from '@angular/core';
import {Http, Response} from "@angular/http";
import {D3ngListComponent} from "../components/d3ng-list.component";
import {D3ngParallelCoordinatesComponent} from "../components/d3ng-parallel-coordinates.component";

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

  @ViewChild('meta') metaDataListElement: D3ngListComponent;
  @ViewChild('pc') pc: D3ngParallelCoordinatesComponent;

  constructor(http: Http) {
    http.get('/assets/owid-2017.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.setDB(res);
      });
  }

  private setDB(db: any): void {
    this.db = db;

    this.data = db.data.map(data => {
      const result = {
        label: data.label,
        code: data.code,
      };
      this.dimensions.forEach(dim => {
        const holder = data.data.filter(d => d.key == dim)[0];
        if (holder) {
          result[dim] = holder.value;
        } else {
          result[dim] = 0;
        }
      });
      return result;
    });

    this.db.meta.forEach(m1 => {
      m1.children = m1.children.filter(m2 => ((m2.countries > 100) && m2.number));
    });
    this.db.meta = this.db.meta.filter(m1 => m1.children.length > 0);
    this.db.meta = this.db.meta.map(m1 => {
      if (m1.children.length == 1) {
        return m1.children[0];
      } else {
        return m1;
      }
    });
    this.metaDataList = [{
      label: "data",
      children: this.db.meta
    }];
    // this.dimensions = this.metaDataList.map(d => d.key);
  }

  ngOnInit() {

  }

}
