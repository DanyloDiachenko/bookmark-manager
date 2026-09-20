import { Component, inject, OnInit } from '@angular/core';
import { Bookmark } from './bookmark/bookmark';
import { BookmarksService } from './bookmarks.service';

@Component({
  selector: 'app-bookmark-screen',
  imports: [Bookmark],
  templateUrl: './bookmark-screen.html',
  host: { class: 'flex-1 flex flex-col min-h-0 overflow-hidden' },
})
export class BookmarkScreen {
  private readonly bookmarkService = inject(BookmarksService);
  readonly bookmarks = this.bookmarkService.bookmarks;
  readonly isLoading = this.bookmarkService.isLoading;
  readonly viewMode = this.bookmarkService.viewMode;
}
