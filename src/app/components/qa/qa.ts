import {Component, ViewEncapsulation} from "angular2/core";
import {NavigationChart} from "../navigation/navigation";
import {Chart} from "../chart/chart";
import {ActivityService} from "../../services/activity";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/Rx";
import {MDL} from "../../mdl";

export class BrushEvent {
  viewport:Array<number>;
  type:string;


  constructor(viewport:Array<number>, type:string) {
    this.viewport = viewport;
    this.type = type;
  }
}

export interface Controls {
  brush:Subject<BrushEvent>;
  updateType:Subject<string>;
  powerLine:Subject<number>;
  cadenceLine:Subject<number>;
}

@Component({
  selector: 'qa',
  template: require('raw!./qa.html'),
  providers: [ActivityService],
  styleUrls: ['app/components/qa/qa.css'],
  directives: [Chart, NavigationChart, MDL],
  encapsulation: ViewEncapsulation.None,
})
export class QuadrantAnalysis {
  public controls:Controls = {
    brush: new Subject(),
    updateType: new BehaviorSubject('brushend'),
    powerLine: new BehaviorSubject(280),
    cadenceLine: new BehaviorSubject(90)
  };

  constructor(public activity:ActivityService) {
  }

  updateTypeChange(event) {
    this.controls.updateType.next(event.currentTarget.checked ? 'brush' : 'brushend');
  }

  updatePowerLine(event) {
    this.controls.powerLine.next(Number(event.currentTarget.value));
  }

  updateCadenceLine(event) {
    this.controls.cadenceLine.next(Number(event.currentTarget.value));
  }

}
