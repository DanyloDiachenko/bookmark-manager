import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import {
  BookmarkFilterParams,
  CreateBookmarkRequest,
  IBookmark,
  UpdateBookmarkRequest,
  ViewMode,
} from './bookmarks.types';
import {
  catchError,
  combineLatest,
  finalize,
  BehaviorSubject,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { BookmarkFilters, BookmarkFiltersService } from './bookmark-filters.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class BookmarksService {
  private readonly http = inject(HttpClient);
  readonly isLoadingSignal = signal<boolean>(true);
  readonly bookmarksSignal = signal<IBookmark[]>([]);
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly bookmarks = this.bookmarksSignal.asReadonly();
  readonly filters = inject(BookmarkFiltersService);
  private readonly destroyRef = inject(DestroyRef);
  readonly allBookmarkCount = computed(() => this.bookmarksSignal().length);
  readonly starredCount = computed(
    () => this.bookmarksSignal().filter((b) => b.isStarred === true).length,
  );
  readonly realLaterCount = computed(
    () => this.bookmarksSignal().filter((b) => b.isReadLater === true).length,
  );

  private readonly viewModeSignal = signal<ViewMode>('grid');
  readonly viewMode = this.viewModeSignal.asReadonly();

  public setViewMode(mode: ViewMode): void {
    this.viewModeSignal.set(mode);
  }

  private readonly refetchTrigger$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.initFiltersPipeline();
  }

  public refetch(): void {
    this.refetchTrigger$.next();
  }

  private initFiltersPipeline() {
    combineLatest([this.filters.filterChange$, this.refetchTrigger$])
      .pipe(
        tap(() => this.isLoadingSignal.set(true)),
        switchMap(([filtersState]) =>
          this.fetchBookmarks(filtersState).pipe(
            catchError(() => of([])),
            finalize(() => this.isLoadingSignal.set(false)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (bookmarks) => {
          this.bookmarksSignal.set(bookmarks);
        },
      });
  }

  private fetchBookmarks(filters: BookmarkFilters) {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);
    if (filters.section === 'starred') params = params.set('isStarred', 'true');
    if (filters.section === 'readLater') params = params.set('isReadLater', 'true');
    if (filters.folderId) params = params.set('folderId', filters.folderId);
    if (filters.tagId) params = params.set('tagId', filters.tagId);

    return this.http.get<IBookmark[]>(`/api/bookmarks`, { params });
  }

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

  public update(id: string, data: UpdateBookmarkRequest): Observable<IBookmark> {
    this.isLoadingSignal.set(true);
    return this.http.put<IBookmark>(`/api/bookmarks/${id}`, data).pipe(
      tap(() => {
        this.refetch();
      }),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }
}
