import {Component, ViewEncapsulation, OnInit, ElementRef} from "angular2/core";
import * as d3 from "d3";
import * as _ from "underscore";
import {ActivityService, NavigationChartPoint} from "../../services/activity";
import {BrushService} from "../../services/viewport";

@Component({
  selector: 'navigation-chart',
  template: '',
  styleUrls: ['app/components/navigation/navigation.css'],
  encapsulation: ViewEncapsulation.None,
})
export class NavigationChart implements OnInit {
  margin = {top: 20, right: 15, bottom: 60, left: 60};
  WIDTH = 960 - this.margin.left - this.margin.right;
  HEIGHT = 250 - this.margin.top - this.margin.bottom;


  constructor(public service:ActivityService, public elementRef:ElementRef, public brush:BrushService) {
  }

  ngOnInit() {
    let navChart = d3.select(this.elementRef.nativeElement).append('svg')
      .attr('width', this.WIDTH + this.margin.left + this.margin.right)
      .attr('height', this.HEIGHT + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');


    this.service.getVelocity()
      .map(data => _.filter(data, (val, idx) => idx % 10 == 0)) // Every n-th element
      .map(data => _.map(data, x => {
        x.distance /= 1000;
        return x
      }))
      .subscribe(data => {

        let xScale = d3.scale.linear()
          .domain([0, d3.max(_.pluck(data, 'distance'))])
          .range([0, this.WIDTH]);

        let xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickFormat(d=>d + ' km');

        navChart.append('g').attr('transform', `translate(0, ${this.HEIGHT})`)
          .attr('class', 'axis')
          .call(xAxis);

        // Altitude
        let altitudeScale = d3.scale.linear().domain([0, d3.max(_.pluck(data, 'altitude'))]).range([this.HEIGHT, 0]);

        let altitudeData = d3.svg.area()
          .x((d:NavigationChartPoint) => xScale(d.distance))
          .y0(this.HEIGHT).y1((d:NavigationChartPoint) => altitudeScale(d.altitude));

        navChart.append('path').attr('class', 'data').attr('d', altitudeData(data));

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
        let brush = d3.svg.brush().x(xScale)
          .on('brushend', () => this.brush.viewport.next(brush.extent()));

        navChart.append("g")
          .attr("class", "brush")
          .call(brush)
          .selectAll("rect")
          .attr("height", this.HEIGHT);


      })
  }
}
