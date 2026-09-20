import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounce, distinctUntilChanged, timer } from 'rxjs';
import { Section } from '../../aside/sections/section.type';

export type BookmarkFilters = {
  section: Section;
  folderId: string | undefined;
  tagId: string | undefined;
  search: string | undefined;
};

@Injectable({
  providedIn: 'root',
})
export class BookmarkFiltersService {
  private readonly defaultFilters: BookmarkFilters = {
    section: 'all',
    search: '',
    folderId: undefined,
    tagId: undefined,
  };

  readonly state = signal<BookmarkFilters>(this.defaultFilters);

  private prevSearch = this.defaultFilters.search;
  private isFirst = true;

  readonly filterChange$ = toObservable(this.state).pipe(
    debounce((filters) => {
      if (this.isFirst) {
        this.isFirst = false;
        this.prevSearch = filters.search;
        return timer(0);
      }
      const searchChanged = filters.search !== this.prevSearch;
      this.prevSearch = filters.search;
      return searchChanged ? timer(250) : timer(0);
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  );

  private updateFilters(patch: Partial<BookmarkFilters>) {
    this.state.update((current) => ({ ...current, ...patch }));
  }

  public setSearch(search: string): void {
    this.updateFilters({ search });
  }

  public setSection(section: Section): void {
    this.updateFilters({ section });
  }

  public toggleFolder(folderId: string): void {
    const current = this.state().folderId;
    this.updateFilters({ folderId: current === folderId ? undefined : folderId });
  }

  public toggleTag(tagId: string): void {
    const current = this.state().tagId;
    this.updateFilters({ tagId: current === tagId ? undefined : tagId });
  }
}
