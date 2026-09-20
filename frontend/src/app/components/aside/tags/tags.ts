import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TagsService } from './tags.service';
import { NgClass } from '@angular/common';
import { BookmarkFiltersService } from '../../screens/bookmark-screen/bookmark-filters.service';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../screens/auth-screen/auth.service';
import { ConfirmModal } from '../../modals/confirm-modal/confirm-modal';
import { ITag } from './tags.types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tags',
  imports: [NgClass, ConfirmModal],
  templateUrl: './tags.html',
  styleUrl: './tags.css',
})
export class Tags implements OnInit {
  private readonly tagsService = inject(TagsService);
  private readonly bookmarkFiltersService = inject(BookmarkFiltersService);
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly tags = this.tagsService.tags;
  readonly currentTagId = computed(() => this.bookmarkFiltersService.state().tagId);
  readonly tagToDelete = signal<ITag | null>(null);
  readonly isDeleting = signal<boolean>(false);

  ngOnInit() {
    this.tagsService.getAll().subscribe();
  }

  public changeCurrentTag(tagId: string) {
    this.bookmarkFiltersService.toggleTag(tagId);
    if (typeof window !== 'undefined' && window.innerWidth < 500) {
      this.sidebarService.close();
    }
  }

  public isLoading(): boolean {
    return this.tagsService.isLoading();
  }

  public openCreateTagModal() {
    this.tagsService.openCreateModal();
  }

  public promptDeleteTag(tag: ITag): void {
    this.tagToDelete.set(tag);
  }

  public closeDeleteModal(): void {
    this.tagToDelete.set(null);
  }

  public confirmDeleteTag(): void {
    const target = this.tagToDelete();
    if (!target) return;

    this.isDeleting.set(true);
    this.tagsService
      .delete(target.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          if (this.currentTagId() === target.id) {
            this.bookmarkFiltersService.toggleTag(target.id);
          }
          this.closeDeleteModal();
        },
      });
  }
}
