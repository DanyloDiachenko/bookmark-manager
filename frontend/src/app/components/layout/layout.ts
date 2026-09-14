import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Aside } from "../aside/aside";
import { Header } from "../header/header";
import { Subheader } from "../subheader/subheader";

@Component({
    imports: [Aside, Header, Subheader, RouterOutlet],
    templateUrl: "./layout.html",
    selector: "app-layout"
})
export class Layout { }