import { Component, inject } from '@angular/core';
import { BookmarksService } from '../screens/bookmark-screen/bookmarks.service';

@Component({
  selector: 'app-subheader',
  imports: [],
  templateUrl: './subheader.html',
  styleUrl: './subheader.css',
  host: { class: 'shrink-0' },
})
export class Subheader {
  private readonly bookmarkService = inject(BookmarksService);
  readonly allBookmarkCount = this.bookmarkService.allBookmarkCount;
}
