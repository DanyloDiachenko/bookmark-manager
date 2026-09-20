import { Component, computed, inject } from '@angular/core';
import { BookmarksService } from '../screens/bookmark-screen/bookmarks.service';
import { BookmarkFiltersService } from '../screens/bookmark-screen/bookmark-filters.service';
import { FoldersService } from '../aside/folders/folders.service';
import { TagsService } from '../aside/tags/tags.service';

@Component({
  selector: 'app-subheader',
  imports: [],
  templateUrl: './subheader.html',
  styleUrl: './subheader.css',
  host: { class: 'shrink-0' },
})
export class Subheader {
  private readonly bookmarkService = inject(BookmarksService);
  private readonly bookmarkFiltersService = inject(BookmarkFiltersService);
  private readonly foldersService = inject(FoldersService);
  private readonly tagService = inject(TagsService);
  readonly allBookmarkCount = this.bookmarkService.filteredCount;
  readonly filters = computed(() => this.bookmarkFiltersService.state());

  readonly sectionTitle = computed(() => {
    switch (this.filters().section) {
      case 'all':
        return 'All';
      case 'starred':
        return 'Starred';
      case 'readLater':
        return 'Read Later';
      default:
        return '';
    }
  });

  readonly folderTitle = computed(() => {
    return this.foldersService.folders().find((folder) => this.filters().folderId === folder.id)
      ?.title;
  });

  readonly tagTitle = computed(() => {
    return this.tagService.tags().find((tag) => this.filters().tagId === tag.id)?.title;
  });
}
