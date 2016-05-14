import {Component, ViewEncapsulation, OnInit, ElementRef, Inject, Input} from "angular2/core";
import * as d3 from "d3";
import {ActivityService, AepfCpv} from "../../services/activity";
import * as _ from "underscore";
import {BrushService} from "../../services/viewport";
import Linear = d3.scale.Linear;
import {Controls} from "../qa/qa";
import {BrushEvent} from "../qa/qa";
var crossfilter = require('crossfilter');

@Component({
  selector: 'chart',
  template: '',
  styleUrls: ['app/components/chart/chart.css'],
  encapsulation: ViewEncapsulation.None,
})
export class Chart implements OnInit {
  data:AepfCpv[];
  @Input() controls:Controls;
  updateType:string = 'brushend';

  MARGIN = {top: 20, right: 15, bottom: 60, left: 60};
  WIDTH = 960 - this.MARGIN.left - this.MARGIN.right;
  HEIGHT = 500 - this.MARGIN.top - this.MARGIN.bottom;

  graphics;
  xScale;
  yScale;

  distanceFilter;


  AEPF_DIST = 10;
  CPV_DIST = 0.1;
  COLOURS:Array<String> = ["#3288bd", "#99d594", "#e6f598", "#fee08b", "#fc8d59", "#d53e4f"];

  constructor(public service:ActivityService, public elementRef:ElementRef) {

    this.xScale = d3.scale.linear().domain([0, 3]).range([0, this.WIDTH]);
    this.yScale = d3.scale.linear().domain([0, 700]).range([this.HEIGHT, 0]);

    let chart = d3.select(this.elementRef.nativeElement)
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
    let xAxis = d3.svg.axis().scale(this.xScale).orient('bottom');

    main.append('g')
      .attr('transform', `translate(0, ${this.HEIGHT})`)
      .attr('class', 'main axis date')
      .call(xAxis);

    // Axes titles
    main.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Average effective pedal force [N]");

    main.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", this.WIDTH)
      .attr("y", this.HEIGHT - 6)
      .text("Circumferential pedal velocity [m/s]");

    // draw the y axis
    let yAxis = d3.svg.axis().scale(this.yScale).orient('left');

    main.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'main axis date')
      .call(yAxis);

    this.graphics = main.append("svg:g");

  }

  linearKernel(p1:AepfCpv, p2:AepfCpv) {
    return 2 - Math.abs((p1.aepf - p2.aepf)) / this.AEPF_DIST - Math.abs((p1.cpv - p2.cpv)) / this.CPV_DIST;
  }

  kde(data:Array<AepfCpv>) {
    data = _.sortBy(data, x => x.aepf);
    let idx = 0;
    _.forEach(data, (point:AepfCpv) => {
      while (point.aepf - this.AEPF_DIST > data[idx].aepf) {
        idx++;
      }
      for (let i = idx; i < data.length && data[i].aepf - point.aepf < this.AEPF_DIST; i++) {
        if (Math.abs(point.cpv - data[i].cpv) < this.CPV_DIST) {
          point.c += this.linearKernel(point, data[i]);
        }
      }
    });
    return data;
  }

  drawChart(data) {
    data = this.kde(data);
    let max = _.max(_.pluck(data, 'c'));
    let colours = d3.scale.pow().exponent(.5)
      .domain(d3.range(0, max, max / this.COLOURS.length))
      .range(this.COLOURS);

    this.graphics.selectAll('.qa-dot').remove();

    this.graphics.selectAll("scatter-dots").data(_.sortBy(data, 'c'))
      .enter().append("svg:circle")
      .attr('class', 'qa-dot')
      .attr("cx", d => this.xScale(d.cpv))
      .attr("cy", d => this.yScale(d.aepf))
      .attr("r", 3)
      .attr("fill", d => colours(d.c));
  }

  ngOnInit() {
    this.service.getAepfCpv()
      .map(data => _.map(data, (x:AepfCpv) => {
        x.distance /= 1000;
        return x
      }))
      .subscribe(data => {
        this.data = data;
        this.distanceFilter = crossfilter(data).dimension(d=>d.distance);
        this.drawChart(data);
      });

    this.controls.updateType.subscribe(x=>this.updateType = x);

    this.controls.brush
      .filter((event:BrushEvent) => event.type === this.updateType)
      .subscribe((event:BrushEvent) => {
        if (event.viewport[0] == event.viewport[1]) {
          this.drawChart(this.data)
        } else {
          this.drawChart(this.distanceFilter.filter(event.viewport).top(Infinity));
        }
      })
  }
}
