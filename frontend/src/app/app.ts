import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aside } from './components/aside/aside';
import { Header } from './components/header/header';
import { Subheader } from './components/subheader/subheader';
import {Bookmarks} from "./components/bookmarks/bookmarks"
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Aside, Header, Subheader, Bookmarks],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
