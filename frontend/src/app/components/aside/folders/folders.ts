import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FoldersService } from './folders.service';
import { NgClass } from '@angular/common';
import { BookmarkFiltersService } from '../../screens/bookmark-screen/bookmark-filters.service';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../screens/auth-screen/auth.service';
import { ConfirmModal } from '../../modals/confirm-modal/confirm-modal';
import { IFolder } from './folders.types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-folders',
  imports: [NgClass, ConfirmModal],
  templateUrl: './folders.html',
  styleUrl: './folders.css',
})
export class Folders implements OnInit {
  private readonly foldersService = inject(FoldersService);
  private readonly bookmarkFiltersService = inject(BookmarkFiltersService);
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly folders = this.foldersService.folders;
  readonly currentFolderId = computed(() => this.bookmarkFiltersService.state().folderId);
  readonly folderToDelete = signal<IFolder | null>(null);
  readonly isDeleting = signal<boolean>(false);

  ngOnInit() {
    this.foldersService.getAll().subscribe();
  }

  public changeFolder(folderId: string) {
    this.bookmarkFiltersService.toggleFolder(folderId);
    if (typeof window !== 'undefined' && window.innerWidth < 500) {
      this.sidebarService.close();
    }
  }

  public isLoading(): boolean {
    return this.foldersService.isLoading();
  }

  public openCreateFolderModal() {
    this.foldersService.openCreateModal();
  }

  public promptDeleteFolder(folder: IFolder): void {
    this.folderToDelete.set(folder);
  }

  public closeDeleteModal(): void {
    this.folderToDelete.set(null);
  }

  public confirmDeleteFolder(): void {
    const target = this.folderToDelete();
    if (!target) return;

    this.isDeleting.set(true);
    this.foldersService
      .delete(target.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          if (this.currentFolderId() === target.id) {
            this.bookmarkFiltersService.toggleFolder(target.id);
          }
          this.closeDeleteModal();
        },
      });
  }
}
