import { Component, inject, input, OnInit } from '@angular/core';
import { IBookmark } from '../bookmarks.types';
import { BookmarksService } from '../bookmarks.service';

@Component({
  selector: 'app-bookmark',
  imports: [],
  templateUrl: './bookmark.html',
  styleUrl: './bookmark.css',
})
export class Bookmark {
  private readonly bookmarkService = inject(BookmarksService);
  readonly bookmark = input.required<IBookmark>();

  public deleteBookmark(id: string) {
    this.bookmarkService.delete(id).subscribe();
  }
}
