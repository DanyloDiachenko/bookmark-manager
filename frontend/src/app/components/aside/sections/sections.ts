import { Component, inject } from '@angular/core';
import { BookmarksService } from '../../screens/bookmark-screen/bookmarks.service';

@Component({
  selector: 'app-sections',
  imports: [],
  templateUrl: './sections.html',
  styleUrl: './sections.css',
})
export class Sections {
  readonly bookmarkService = inject(BookmarksService);
  readonly allBookmarkCount = this.bookmarkService.allBookmarkCount;
  readonly starredBookmarkCount = this.bookmarkService.starredCount;
  readonly readLaterBookmarkCount = this.bookmarkService.realLaterCount;
}
