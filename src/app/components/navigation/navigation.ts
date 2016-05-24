import {Component, ViewEncapsulation, OnInit, ElementRef} from "angular2/core";
import * as d3 from "d3";
import * as _ from "underscore";
import {ActivityService, NavigationChartPoint} from "../../services/activity";
import {BrushService} from "../../services/viewport";
import {Input} from "angular2/core";
import {AepfCpv} from "../../services/activity";
import {Controls} from "../qa/qa";
import {BrushEvent} from "../qa/qa";

@Component({
  selector: 'navigation-chart',
  template: '',
  styles: [require('./navigation.css').toString()],
  encapsulation: ViewEncapsulation.None,
})
export class NavigationChart implements OnInit {
  margin = {top: 20, right: 15, bottom: 60, left: 60};
  WIDTH = 960 - this.margin.left - this.margin.right;
  HEIGHT = 250 - this.margin.top - this.margin.bottom;

  @Input() controls:Controls;


  constructor(public service:ActivityService, public elementRef:ElementRef) {
  }

  ngOnInit() {
    let navChart = d3.select(this.elementRef.nativeElement).append('svg')
      .attr('width', this.WIDTH + this.margin.left + this.margin.right)
      .attr('height', this.HEIGHT + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

  navChart.append("text")
      .attr("x", 0)
      .attr("y", -8)
      .style("font-size", "16px")
      .text("Navigation");


    this.service.getVelocity()
      .map(data => _.filter(data, (val, idx) => idx % 10 == 0)) // Every n-th element
      .map(data => _.map(data, (x:NavigationChartPoint) => {
        x.distance /= 1000;
        return x
      }))
      .subscribe(data => {
        // Remove navigation chart data so it doesn't persist on activity refresh
        d3.select('.xAxis').remove();
        d3.select('.line.speed').remove();
        d3.select('.line.watts').remove();
        d3.select('.altitude').remove();

        let xScale = d3.scale.linear()
          .domain([0, d3.max(_.pluck(data, 'distance'))])
          .range([0, this.WIDTH]);

        let xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickFormat(d=>d + ' km');

        navChart.append('g').attr('transform', `translate(0, ${this.HEIGHT})`)
          .attr('class', 'xAxis axis')
          .call(xAxis);

        // Altitude
        let altitudeScale = d3.scale.linear().domain([0, d3.max(_.pluck(data, 'altitude'))]).range([this.HEIGHT, 0]);

        let altitudeData = d3.svg.area()
          .x((d:NavigationChartPoint) => xScale(d.distance))
          .y0(this.HEIGHT).y1((d:NavigationChartPoint) => altitudeScale(d.altitude));

        navChart.append('path').attr('class', 'altitude').attr('d', altitudeData(data));

        // Velocity
        let velocityScale = d3.scale.linear().domain([0, d3.max(_.pluck(data, 'velocity'))]).range([this.HEIGHT / 2, 0]);

        let velocityLine = d3.svg.line()
          .x((d:NavigationChartPoint) => xScale(d.distance))
          .y((d:NavigationChartPoint) => velocityScale(d.velocity));

        navChart.append('path').attr('class', 'line speed').attr('d', velocityLine(data));

        // Power
        let wattsScale = d3.scale.linear().domain([0, d3.max(_.pluck(data, 'power'))]).range([this.HEIGHT / 2, 0]);

        let wattsLine = d3.svg.line()
          .x((d:NavigationChartPoint) => xScale(d.distance))
          .y((d:NavigationChartPoint) => wattsScale(d.power));

        navChart.append('path')
          .attr('transform', `translate(0, ${this.HEIGHT / 2})`)
          .attr('class', 'line watts').attr('d', wattsLine(data));

        // Brush
        let brush = d3.svg.brush().x(xScale);
        brush.on('brushend', () => this.controls.brush.next(new BrushEvent(brush.extent(), 'brushend')));
        brush.on('brush', () => this.controls.brush.next(new BrushEvent(brush.extent(), 'brush')));

        navChart.append("g")
          .attr("class", "brush")
          .call(brush)
          .selectAll("rect")
          .attr("height", this.HEIGHT);


      })
  }
}
