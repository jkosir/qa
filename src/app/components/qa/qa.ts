import {Component, ViewEncapsulation} from "angular2/core";
import {NavigationChart} from "../navigation/navigation";
import {Chart} from "../chart/chart";
import {ActivityService} from "../../services/activity";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/Rx";
import {MDL} from "../../mdl";

export class BrushEvent {
  viewport:[number, number];
  type:string;


  constructor(viewport:Array<number>, type:string) {
    this.viewport = viewport;
    this.type = type;
  }
}

export interface Controls {
  brush:Subject<BrushEvent>;
  updateType:Subject<string>;
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
    updateType: new BehaviorSubject('brushend')
  };

  constructor() {
  }

  updateTypeChange(event) {
    this.controls.updateType.next(event.currentTarget.checked ? 'brush' : 'brushend');
  }

}