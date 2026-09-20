import { Component, inject, input, signal } from '@angular/core';
import { IBookmark, ViewMode } from '../bookmarks.types';
import { BookmarksService } from '../bookmarks.service';
import { ConfirmModal } from '../../../modals/confirm-modal/confirm-modal';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-bookmark',
  imports: [ConfirmModal],
  templateUrl: './bookmark.html',
  styleUrl: './bookmark.css',
  host: { class: 'contents' },
})
export class Bookmark {
  private readonly bookmarkService = inject(BookmarksService);
  readonly bookmark = input.required<IBookmark>();
  readonly viewMode = input<ViewMode>('grid');
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);

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

  public openDeleteModal(): void {
    this.isDeleteModalOpen.set(true);
  }

  public closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
  }

  public confirmDeleteBookmark(): void {
    this.isDeleting.set(true);
    this.bookmarkService
      .delete(this.bookmark().id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.closeDeleteModal();
        },
      });
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
