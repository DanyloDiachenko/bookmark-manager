import { Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { BookmarksService } from '../../screens/bookmark-screen/bookmarks.service';
import { Section } from './section.type';
import { BookmarkFiltersService } from '../../screens/bookmark-screen/bookmark-filters.service';

@Component({
  selector: 'app-sections',
  imports: [NgClass],
  templateUrl: './sections.html',
  styleUrl: './sections.css',
})
export class Sections {
  readonly bookmarkService = inject(BookmarksService);
  readonly bookmarkFiltersService = inject(BookmarkFiltersService);
  readonly allBookmarkCount = this.bookmarkService.allBookmarkCount;
  readonly starredBookmarkCount = this.bookmarkService.starredCount;
  readonly readLaterBookmarkCount = this.bookmarkService.realLaterCount;
  readonly currentSection = computed(() => this.bookmarkFiltersService.state().section);

  public changeSection(section: Section): void {
    this.bookmarkFiltersService.setSection(section);
  }
}
