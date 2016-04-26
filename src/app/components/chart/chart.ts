import {Component, Directive, Attribute, ElementRef} from 'angular2/core';
import * as d3 from 'd3';
import {ViewEncapsulation} from "angular2/core";
import {ActivityService} from "../../services/activity";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import * as _ from 'underscore';

@Component({
  selector: 'chart',
  templateUrl: 'app/components/chart/chart.html',
  styleUrls: ['app/components/chart/chart.css'],
  providers: [ActivityService],
  encapsulation: ViewEncapsulation.None,
})
export class Chart {
  data:Array<any>;
  MARGIN = {top: 20, right: 15, bottom: 60, left: 60};
  WIDTH = 960 - this.MARGIN.left - this.MARGIN.right;
  HEIGHT = 500 - this.MARGIN.top - this.MARGIN.bottom;


  constructor(public service:ActivityService) {
    this.service = service;
  }

  ngOnInit() {

    let x = d3.scale.linear().domain([0, 3]).range([0, this.WIDTH]);

    let y = d3.scale.linear().domain([0, 700]).range([this.HEIGHT, 0]);

    let chart = d3.select("body")
      .append('svg:svg')
      .attr('width', this.WIDTH + this.MARGIN.right + this.MARGIN.left)
      .attr('height', this.HEIGHT + this.MARGIN.top + this.MARGIN.bottom)
      .attr('class', 'chart');

    let main = chart.append('g')
      .attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .attr('width', this.WIDTH)
      .attr('height', this.HEIGHT)
      .attr('class', 'main');

    // draw the x axis
    let xAxis = d3.svg.axis().scale(x).orient('bottom');

    main.append('g')
      .attr('transform', `translate(0, ${this.HEIGHT})`)
      .attr('class', 'main axis date')
      .call(xAxis);

    // draw the y axis
    let yAxis = d3.svg.axis().scale(y).orient('left');

    main.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'main axis date')
      .call(yAxis);

    let g = main.append("svg:g");

    this.service.getAepfCpv().map(d=>_.first(d,100)).subscribe(data => {
      g.selectAll("scatter-dots")
        .data(data)
        .enter().append("svg:circle")
        .attr("cx", d => x(d.cpv))
        .attr("cy", d => y(d.aepf))
        .attr("r", 4);
    });
  }
}
