import { Component } from '@angular/core';
import { Sections } from './sections/sections';
import { Folders } from './folders/folders';
import { Tags } from './tags/tags';
import { Saved } from './saved/saved';

@Component({
  selector: 'app-aside',
  imports: [Sections, Folders, Tags, Saved],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {}
