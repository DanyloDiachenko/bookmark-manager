import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import {
  BookmarkFilterParams,
  BookmarkStats,
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
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { BookmarkFilters, BookmarkFiltersService } from './bookmark-filters.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth-screen/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarksService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  readonly isLoadingSignal = signal<boolean>(true);
  readonly bookmarksSignal = signal<IBookmark[]>([]);
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly bookmarks = this.bookmarksSignal.asReadonly();
  readonly filters = inject(BookmarkFiltersService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly statsSignal = signal<BookmarkStats>({
    all: 0,
    starred: 0,
    readLater: 0,
  });

  readonly allBookmarkCount = computed(() => this.statsSignal().all);
  readonly starredCount = computed(() => this.statsSignal().starred);
  readonly realLaterCount = computed(() => this.statsSignal().readLater);
  readonly filteredCount = computed(() => this.bookmarksSignal().length);

  private readonly viewModeSignal = signal<ViewMode>('grid');
  readonly viewMode = this.viewModeSignal.asReadonly();

  public setViewMode(mode: ViewMode): void {
    this.viewModeSignal.set(mode);
  }

  private readonly refetchTrigger$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.initFiltersPipeline();
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.fetchStats().subscribe();
      } else {
        this.statsSignal.set({ all: 0, starred: 0, readLater: 0 });
      }
    });
  }

  public refetch(): void {
    this.refetchTrigger$.next();
  }

  public fetchStats(): Observable<BookmarkStats> {
    return this.http.get<BookmarkStats>('/api/bookmarks/stats').pipe(
      catchError(() =>
        this.http.get<IBookmark[]>('/api/bookmarks').pipe(
          map((bms) => ({
            all: bms.length,
            starred: bms.filter((b) => b.isStarred).length,
            readLater: bms.filter((b) => b.isReadLater).length,
          })),
        ),
      ),
      tap((stats) => this.statsSignal.set(stats)),
    );
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
      tap((bookmark) => {
        this.statsSignal.update((stats) => ({
          all: stats.all + 1,
          starred: bookmark.isStarred ? stats.starred + 1 : stats.starred,
          readLater: bookmark.isReadLater ? stats.readLater + 1 : stats.readLater,
        }));
        this.refetch();
        this.fetchStats().subscribe();
      }),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }

  public delete(id: string): Observable<void> {
    this.isLoadingSignal.set(true);
    const target = this.bookmarksSignal().find((b) => b.id === id);
    return this.http.delete<void>(`/api/bookmarks/${id}`).pipe(
      tap(() => {
        this.bookmarksSignal.update((bookmarks) => bookmarks.filter((b) => b.id !== id));
        if (target) {
          this.statsSignal.update((stats) => ({
            all: Math.max(0, stats.all - 1),
            starred: target.isStarred ? Math.max(0, stats.starred - 1) : stats.starred,
            readLater: target.isReadLater ? Math.max(0, stats.readLater - 1) : stats.readLater,
          }));
        }
        this.fetchStats().subscribe();
      }),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }

  public update(id: string, data: UpdateBookmarkRequest): Observable<IBookmark> {
    this.isLoadingSignal.set(true);
    const previous = this.bookmarksSignal().find((b) => b.id === id);
    return this.http.put<IBookmark>(`/api/bookmarks/${id}`, data).pipe(
      tap(() => {
        if (previous) {
          this.statsSignal.update((stats) => {
            let starredDelta = 0;
            if (data.isStarred !== undefined && data.isStarred !== previous.isStarred) {
              starredDelta = data.isStarred ? 1 : -1;
            }
            let readLaterDelta = 0;
            if (data.isReadLater !== undefined && data.isReadLater !== previous.isReadLater) {
              readLaterDelta = data.isReadLater ? 1 : -1;
            }
            return {
              all: stats.all,
              starred: Math.max(0, stats.starred + starredDelta),
              readLater: Math.max(0, stats.readLater + readLaterDelta),
            };
          });
        }
        this.refetch();
        this.fetchStats().subscribe();
      }),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }
}
