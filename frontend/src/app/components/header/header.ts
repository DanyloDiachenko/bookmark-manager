import { Component } from '@angular/core';
import { Search } from "./search/search";
import { Controls } from "./controls/controls"

@Component({
  selector: 'app-header',
  imports: [Search, Controls],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header { }
