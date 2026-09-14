import { Component } from '@angular/core';
import { Bookmark } from './bookmark/bookmark';

@Component({
  selector: 'app-bookmark-screen',
  imports: [Bookmark],
  templateUrl: './bookmark-screen.html',
  host: { class: 'flex-1 flex flex-col min-h-0 overflow-hidden' },
})
export class BookmarkScreen {
  items = Array.from({ length: 9 }, (_, i) => i);
}
