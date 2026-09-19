import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { BookmarksService } from '../../screens/bookmark-screen/bookmarks.service';
import { Section } from './section.type';

@Component({
  selector: 'app-sections',
  imports: [NgClass],
  templateUrl: './sections.html',
  styleUrl: './sections.css',
})
export class Sections {
  readonly bookmarkService = inject(BookmarksService);
  readonly allBookmarkCount = this.bookmarkService.allBookmarkCount;
  readonly starredBookmarkCount = this.bookmarkService.starredCount;
  readonly readLaterBookmarkCount = this.bookmarkService.realLaterCount;
  private readonly currentSectionSignal = signal<Section>('all');
  readonly currentSection = this.currentSectionSignal.asReadonly();

  public changeSection(section: Section): void {
    this.currentSectionSignal.set(section);
  }
}
