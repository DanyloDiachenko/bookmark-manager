import { Component } from '@angular/core';
import { Bookmark } from './bookmark/bookmark';

@Component({
  selector: 'app-bookmarks',
  imports: [Bookmark],
  templateUrl: './bookmarks.html',
  styleUrl: './bookmarks.css',
})
export class Bookmarks {
  items = Array.from({ length: 9 }, (_, i) => i);
}
