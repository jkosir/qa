import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import * as _ from 'underscore';
import {Observable} from "rxjs/Observable";

export class AepfCpv {
  aepf:number;
  cpv:number;
  distance:number;
  c:number;

  constructor(aepf:number, cpv:number, distance:number) {
    this.aepf = aepf;
    this.cpv = cpv;
    this.distance = distance;
    this.c = 0;
  }
}
export class NavigationChartPoint {
  distance:number;
  velocity:number;
  altitude:number;
  power:number;


  constructor(distance:number, velocity:number, altitude:number, power:number) {
    this.distance = distance;
    this.velocity = velocity;
    this.altitude = altitude;
    this.power = power;
  }
}

@Injectable()
export class ActivityService {

  constructor(private http:Http) {
  }

  getVelocity():Observable<Array<NavigationChartPoint>> {
    return this.http.get('/app/data/act.json')
      .map(data => data.json())
      .map(data => _.map(_.zip(data['distance'], data['velocity_smooth'], data['altitude'], data['watts']),
        x => new NavigationChartPoint(x[0], x[1], x[2], x[3])
      ))
  }

  getAepfCpv():Observable<Array<AepfCpv>> {
    // Convert watts and cadence to average effective pedal force and circumferential pedal velocity
    // Assume crank length of 172.5mm

    return this.http.get('/app/data/act.json')
      .map(data => data.json())
      // Convert to AEPF/CPV
      .map(data =>
        _.map(_.zip(data['watts'], data['cadence'], data['distance']), x => new AepfCpv(
          (x[0] * 60) / (x[1] * 2 * Math.PI * 0.1725),
          x[1] * 0.1725 * 2 * Math.PI / 60,
          x[2]
        ))
      )
      // Filter NaN and Infinity
      .map(data => _.filter(data, x => _.isFinite(x.aepf) && _.isFinite(x.cpv)))
  }
}
