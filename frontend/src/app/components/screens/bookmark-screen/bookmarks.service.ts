import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, OnInit, signal } from '@angular/core';
import { CreateBookmarkRequest, IBookmark } from './bookmarks.types';
import { finalize, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookmarksService {
  private readonly http = inject(HttpClient);
  readonly isLoadingSignal = signal<boolean>(false);
  readonly bookmarksSignal = signal<IBookmark[]>([]);
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly bookmarks = this.bookmarksSignal.asReadonly();

  readonly allBookmarkCount = computed(() => this.bookmarksSignal().length);

  readonly starredCount = computed(
    () => this.bookmarksSignal().filter((b) => b.isStarred === true).length,
  );

  readonly realLaterCount = computed(
    () => this.bookmarksSignal().filter((b) => b.isReadLater === true).length,
  );

  public getAll(): Observable<IBookmark[]> {
    this.isLoadingSignal.set(true);
    return this.http.get<IBookmark[]>(`/api/bookmarks`).pipe(
      tap((bookmarks) => this.bookmarksSignal.set(bookmarks)),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }

  public create(payload: CreateBookmarkRequest): Observable<IBookmark> {
    this.isLoadingSignal.set(true);
    return this.http.post<IBookmark>('/api/bookmarks', payload).pipe(
      tap((tag) => this.bookmarksSignal.update((tags) => [...tags, tag])),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }

  public delete(id: string): Observable<void> {
    this.isLoadingSignal.set(true);
    return this.http.delete<void>(`/api/bookmarks/${id}`).pipe(
      tap(() => this.bookmarksSignal.update((bookmarks) => bookmarks.filter((b) => b.id !== id))),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }
}
