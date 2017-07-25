import {Component} from "@angular/core";
import * as d3 from "d3";
import {Http, Response} from "@angular/http";
import * as moment from 'moment';
import {D3ngGroupContext} from "../../lib/d3ng-groups.component";

@Component({
  selector: 'd3ng-grammar-demo',
  templateUrl: './d3ng-grammar-demo.component.html',
  styleUrls: [ './d3ng-grammar-demo.component.css' ]
})
export class D3ngGrammarDemoComponent {
  groupContext = new D3ngGroupContext();
  weather = [];
  cars = [];

  constructor(http: Http) {
    http.get('/assets/seattle-weather.csv')
      .map((res: Response) => res)
      .subscribe(res => {
        this.weather = d3.csv.parse(res.text());
      });

    http.get('/assets/cars.json')
      .map((res: Response) => res)
      .subscribe(res => {
        this.cars = JSON.parse(res.text());
      });
  }
}

