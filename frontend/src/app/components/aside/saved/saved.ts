import { Component, inject } from '@angular/core';
import { BookmarksService } from '../../screens/bookmark-screen/bookmarks.service';

@Component({
  selector: 'app-saved',
  imports: [],
  templateUrl: './saved.html',
  styleUrl: './saved.css',
})
export class Saved {
  private readonly bookmarkService = inject(BookmarksService);
  readonly allBookmarkCount = this.bookmarkService.allBookmarkCount;
}
