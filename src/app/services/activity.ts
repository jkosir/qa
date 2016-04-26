import {Injectable} from 'angular2/core';
import {Http, URLSearchParams} from 'angular2/http';
import * as _ from 'underscore';

class AepfCpv {
  aepf:number;
  cpv:number;

  constructor(aepf:number, cpv:number) {
    this.aepf = aepf;
    this.cpv = cpv;
  }
}

@Injectable()
export class ActivityService {
  constructor(private http:Http) {
  }

  get() {
    return this.http.get('/app/data/activity.json');
  }

  getAepfCpv() {
    // Convert watts and cadence to average effective pedal force and circumferential pedal velocity
    // Assume crank length of 172.5mm
    return this.get()
      .map(data => data.json())
      // Convert to AEPF/CPV
      .map(data =>
        _.map(_.zip(data['watts'], data['cadence']), x => new AepfCpv(
          (x[0] * 60) / (x[1] * 2 * Math.PI * 0.1725),
          x[1] * 0.1725 * 2 * Math.PI / 60
        ))
      )
      // Filter NaN and Infinity
      .map(data => _.filter(data, x => _.isFinite(x.aepf) && _.isFinite(x.cpv)))
  }
}
