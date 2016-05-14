import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import * as _ from 'underscore';
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

var OAuth = require('oauthio-web').OAuth;

export class AepfCpv {
  aepf:number;
  cpv:number;
  distance:number;
  c:number;
  power:number;
  cadence:number;

  constructor(aepf:number, cpv:number, distance:number, power:number, cadence:number) {
    this.aepf = aepf;
    this.cpv = cpv;
    this.distance = distance;
    this.c = 0;
    this.power = power;
    this.cadence = cadence;
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
  act_id = 565287513;
  api;
  private activityLoader:Subject = new Subject();
  public stravaConnected:boolean = false;

  constructor(private http:Http) {
    OAuth.initialize('Zcy9H_R3eAhBKyDr1sO_db3wLcA');
    this.http.get('/app/data/act.json').subscribe(d => this.activityLoader.next(d.json()));
    // this.stravaAuth().done(r=>this.loadFromStrava(r,this.act_id));
  }

  public stravaAuth() {
    
    OAuth.popup('strava').done(r=>{
      this.stravaConnected = true;
      this.api=r;
    });
  }

  loadFromStrava(activityId) {
    let url = `/v3/activities/${activityId}/streams/watts,cadence,distance,velocity_smooth,altitude`;
    this.api.get(url).done(response => {
      let data = _.object(_.zip(_.pluck(response, 'type'), _.pluck(response, 'data')));
      this.activityLoader.next(data);
    });
  }


  getVelocity():Observable<Array<NavigationChartPoint>> {
    return this.activityLoader
      .map(data => _.map(_.zip(data['distance'], data['velocity_smooth'], data['altitude'], data['watts']),
        x => new NavigationChartPoint(x[0], x[1], x[2], x[3])
      ))
  }

  getAepfCpv():Observable<Array<AepfCpv>> {
    // Convert watts and cadence to average effective pedal force and circumferential pedal velocity
    // Assume crank length of 172.5mm

    return this.activityLoader
      // Convert to AEPF/CPV
      .map(data =>
        _.map(_.zip(data['watts'], data['cadence'], data['distance']), x => new AepfCpv(
          (x[0] * 60) / (x[1] * 2 * Math.PI * 0.1725),
          x[1] * 0.1725 * 2 * Math.PI / 60,
          x[2],
          x[0],
          x[1]
        ))
      )
      // Filter NaN and Infinity
      .map(data => _.filter(data, x => _.isFinite(x.aepf) && _.isFinite(x.cpv)))
  }
}
