import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
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
  private readonly state$ = new BehaviorSubject<BookmarkFilters>(this.defaultFilters);
  readonly filterChange$ = this.state$.pipe(
    debounceTime(250),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  );
  readonly state = signal<BookmarkFilters>(this.defaultFilters);

  private updateFilters(patch: Partial<BookmarkFilters>) {
    const newState = { ...this.state(), ...patch };
    this.state.set(newState);
    this.state$.next(newState);
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
