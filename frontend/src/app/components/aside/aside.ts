import { Component, HostListener, inject } from '@angular/core';
import { Sections } from './sections/sections';
import { Folders } from './folders/folders';
import { Tags } from './tags/tags';
import { Saved } from './saved/saved';
import { SidebarService } from '../../services/sidebar.service';
import { NgClass } from '@angular/common';
import { FoldersService } from './folders/folders.service';
import { TagsService } from './tags/tags.service';
import { CreateFolderModal } from '../modals/create-folder-modal/create-folder-modal';
import { CreateTagModal } from '../modals/create-tag-modal/create-tag-modal';
import { CreateFolderRequest } from './folders/folders.types';
import { CreateTagRequest } from './tags/tags.types';

@Component({
  selector: 'app-aside',
  imports: [
    Sections,
    Folders,
    Tags,
    Saved,
    NgClass,
    CreateFolderModal,
    CreateTagModal,
  ],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {
  private readonly sidebarService = inject(SidebarService);
  readonly foldersService = inject(FoldersService);
  readonly tagsService = inject(TagsService);
  readonly isOpen = this.sidebarService.isOpen;

  public close(): void {
    this.sidebarService.close();
  }

  public createFolder(data: CreateFolderRequest): void {
    this.foldersService.create(data).subscribe({
      next: () => this.foldersService.closeCreateModal(),
    });
  }

  public createTag(data: CreateTagRequest): void {
    this.tagsService.create(data).subscribe({
      next: () => this.tagsService.closeCreateModal(),
    });
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    if (this.foldersService.isCreateModalOpened()) {
      this.foldersService.closeCreateModal();
      return;
    }
    if (this.tagsService.isCreateModalOpened()) {
      this.tagsService.closeCreateModal();
      return;
    }
    if (this.isOpen()) {
      this.close();
    }
  }
}
