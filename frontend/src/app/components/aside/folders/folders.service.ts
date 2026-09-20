import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CreateFolderRequest, IFolder } from './folders.types';
import { finalize, Observable, tap } from 'rxjs';
import { BookmarkFiltersService } from '../../screens/bookmark-screen/bookmark-filters.service';

@Injectable({
  providedIn: 'root',
})
export class FoldersService {
  private readonly http = inject(HttpClient)
  private readonly foldersSignal = signal<IFolder[]>([]);
  private readonly isLoadingSignal = signal<boolean>(false);
  readonly folders = this.foldersSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isCreateModalOpened = signal<boolean>(false);

  private readonly bookmarkFiltersService = inject(BookmarkFiltersService);
  readonly folderToDelete = signal<IFolder | null>(null);
  readonly isDeleting = signal<boolean>(false);

  public promptDelete(folder: IFolder): void {
    this.folderToDelete.set(folder);
  }

  public closeDeleteModal(): void {
    this.folderToDelete.set(null);
  }

  public confirmDelete(): void {
    const target = this.folderToDelete();
    if (!target) return;

    this.isDeleting.set(true);
    this.delete(target.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          if (this.bookmarkFiltersService.state().folderId === target.id) {
            this.bookmarkFiltersService.toggleFolder(target.id);
          }
          this.closeDeleteModal();
        },
      });
  }

  public openCreateModal(): void {
    this.isCreateModalOpened.set(true);
  }

  public closeCreateModal(): void {
    this.isCreateModalOpened.set(false);
  }

  public getAll(): Observable<IFolder[]> {
    this.isLoadingSignal.set(true);
    return this.http.get<IFolder[]>('/api/folders').pipe(
      tap((folders) => this.foldersSignal.set(folders)),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }

  public create(payload: CreateFolderRequest): Observable<IFolder> {
    this.isLoadingSignal.set(true);
    return this.http.post<IFolder>('/api/folders', payload).pipe(
      tap((folder) => this.foldersSignal.update((folders) => [...folders, folder])),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }

  public delete(id: string): Observable<void> {
    this.isLoadingSignal.set(true);
    return this.http.delete<void>(`/api/folders/${id}`).pipe(
      tap(() => this.foldersSignal.update((folders) => folders.filter((f) => f.id !== id))),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }
}
