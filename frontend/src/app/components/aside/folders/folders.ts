import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FoldersService } from './folders.service';
import { CreateFolderRequest } from './folders.types';
import { CreateFolderModal } from '../../modals/create-folder-modal/create-folder-modal';
import { NgClass } from '@angular/common';
import { BookmarkFiltersService } from '../../screens/bookmark-screen/bookmark-filters.service';

@Component({
  selector: 'app-folders',
  imports: [CreateFolderModal, NgClass],
  templateUrl: './folders.html',
  styleUrl: './folders.css',
})
export class Folders implements OnInit {
  private readonly foldersService = inject(FoldersService);
  private readonly bookmarkFiltersService = inject(BookmarkFiltersService);
  readonly folders = this.foldersService.folders;
  readonly isCreateFolderModalOpened = signal<boolean>(false);
  readonly currentFolderId = computed(() => this.bookmarkFiltersService.state().folderId);

  ngOnInit() {
    this.foldersService.getAll().subscribe();
  }

  public changeFolder(folderId: string) {
    this.bookmarkFiltersService.toggleFolder(folderId);
  }

  public isLoading(): boolean {
    return this.foldersService.isLoading();
  }

  public openCreateFolderModal() {
    this.isCreateFolderModalOpened.set(true);
  }

  public closeCreateFolderModal() {
    this.isCreateFolderModalOpened.set(false);
  }

  public createFolder(data: CreateFolderRequest) {
    this.foldersService.create(data).subscribe({
      next: () => this.closeCreateFolderModal(),
    });
  }

  public deleteFolder(id: string) {
    this.foldersService.delete(id).subscribe();
  }
}
