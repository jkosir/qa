import {Injectable} from "angular2/core";
import {Subject} from "rxjs/Subject";


@Injectable()
export class BrushService {
  public viewport:Subject<number[]> = new Subject();

  constructor() {
  }


}
