import {bootstrap} from "angular2/platform/browser";
import {HTTP_PROVIDERS} from "angular2/http";
import {SeedApp} from "./app/seed-app";


bootstrap(SeedApp, [
  HTTP_PROVIDERS
])
.catch(err => console.error(err));
