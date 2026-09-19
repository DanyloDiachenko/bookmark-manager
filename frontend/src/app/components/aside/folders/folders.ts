import { Component, inject, OnInit, signal } from '@angular/core';
import { FoldersService } from './folders.service';
import { CreateFolderRequest } from './folders.types';
import { CreateFolderModal } from '../../modals/create-folder-modal/create-folder-modal';

@Component({
  selector: 'app-folders',
  imports: [CreateFolderModal],
  templateUrl: './folders.html',
  styleUrl: './folders.css',
})
export class Folders implements OnInit {
  readonly foldersService = inject(FoldersService);
  readonly folders = this.foldersService.folders;
  readonly isCreateFolderModalOpened = signal<boolean>(false);

  ngOnInit() {
    this.foldersService.getAll().subscribe();
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
