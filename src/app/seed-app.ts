import {Component} from "angular2/core";

import {QuadrantAnalysis} from "./components/qa/qa";
import {BrushService} from "./services/viewport";


require('../../node_modules/material-design-lite/dist/material.css');

@Component({
  selector: 'app',
  pipes: [],
  providers: [BrushService],
  directives: [QuadrantAnalysis],
  template: require('raw!./seed-app.html')
})
export class SeedApp {

  constructor() {
  }

}
