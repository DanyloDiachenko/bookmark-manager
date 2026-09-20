import { Component, computed, inject } from '@angular/core';
import { BookmarkFiltersService } from '../../screens/bookmark-screen/bookmark-filters.service';

@Component({
  selector: 'app-search',
  imports: [],
  templateUrl: './search.html',
  styleUrl: './search.css',
  host: { class: 'max-w-sm flex-1' },
})
export class Search {
  private readonly bookmarkFiltersService = inject(BookmarkFiltersService);
  readonly search = computed(() => this.bookmarkFiltersService.state().search ?? '');

  public setSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.bookmarkFiltersService.setSearch(input.value);
  }
}
