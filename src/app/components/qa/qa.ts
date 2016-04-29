import {Component, ViewEncapsulation} from "angular2/core";
import {NavigationChart} from "../navigation/navigation";
import {Chart} from "../chart/chart";
import {ActivityService} from "../../services/activity";


@Component({
  selector: 'qa',
  template: '<chart></chart><navigation-chart></navigation-chart>',
  providers: [ActivityService],
  directives: [Chart, NavigationChart],
  encapsulation: ViewEncapsulation.None,
})
export class QuadrantAnalysis {

  constructor() {

  }


}
