import { Component, inject, input, OnInit } from '@angular/core';
import { IBookmark, ViewMode } from '../bookmarks.types';
import { BookmarksService } from '../bookmarks.service';

@Component({
  selector: 'app-bookmark',
  imports: [],
  templateUrl: './bookmark.html',
  styleUrl: './bookmark.css',
  host: { class: 'contents' },
})
export class Bookmark {
  private readonly bookmarkService = inject(BookmarksService);
  readonly bookmark = input.required<IBookmark>();
  readonly viewMode = input<ViewMode>('grid');

  public getDomain(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  public getFormattedDate(dateStr: string): string {
    try {
      return dateStr.split('T')[0];
    } catch {
      return dateStr;
    }
  }

  public deleteBookmark(id: string) {
    this.bookmarkService.delete(id).subscribe();
  }

  public toggleStarred(bookmarkId: string) {
    this.bookmarkService
      .update(bookmarkId, {
        isStarred: !this.bookmark().isStarred,
      })
      .subscribe();
  }

  public toggleReadLater(bookmarkId: string) {
    this.bookmarkService
      .update(bookmarkId, {
        isReadLater: !this.bookmark().isReadLater,
      })
      .subscribe();
  }
}
