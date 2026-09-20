import { Component, computed, inject, OnInit } from '@angular/core';
import { FoldersService } from './folders.service';
import { NgClass } from '@angular/common';
import { BookmarkFiltersService } from '../../screens/bookmark-screen/bookmark-filters.service';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../screens/auth-screen/auth.service';
import { IFolder } from './folders.types';

@Component({
  selector: 'app-folders',
  imports: [NgClass],
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
    this.foldersService.promptDelete(folder);
  }
}
