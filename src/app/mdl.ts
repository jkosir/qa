import {Directive, AfterViewInit} from 'angular2/core';
require('material-design-lite');

declare var componentHandler;

@Directive({
  selector: '[mdl]'
})
export class MDL implements AfterViewInit {
  ngAfterViewInit() {
    componentHandler.upgradeAllRegistered();
  }
}
