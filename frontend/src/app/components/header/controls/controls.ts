import { Component, inject, signal } from '@angular/core';
import { CreateBookmarkModal } from '../../modals/create-bookmark-modal/create-bookmark-modal';
import { BookmarksService } from '../../screens/bookmark-screen/bookmarks.service';

@Component({
  selector: 'app-controls',
  imports: [CreateBookmarkModal],
  templateUrl: './controls.html',
  styleUrl: './controls.css',
  host: { class: 'ml-auto' },
})
export class Controls {
  private readonly bookmarkService = inject(BookmarksService);
  readonly isCreateBookmarkModalOpened = signal<boolean>(false);
  readonly viewMode = this.bookmarkService.viewMode;

  public setViewMode(mode: 'grid' | 'list') {
    this.bookmarkService.setViewMode(mode);
  }

  public openCreateBookmarkModal() {
    this.isCreateBookmarkModalOpened.set(true);
  }

  public closeCreateBookmarkModal() {
    this.isCreateBookmarkModalOpened.set(false);
  }

  public isLoading() {
    return this.bookmarkService.isLoading();
  }
}
