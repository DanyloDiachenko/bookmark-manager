import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TagsService } from './tags.service';
import { CreateTagModal } from '../../modals/create-tag-modal/create-tag-modal';
import { CreateTagRequest } from './tags.types';
import { NgClass } from '@angular/common';
import { BookmarkFiltersService } from '../../screens/bookmark-screen/bookmark-filters.service';

@Component({
  selector: 'app-tags',
  imports: [CreateTagModal, NgClass],
  templateUrl: './tags.html',
  styleUrl: './tags.css',
})
export class Tags implements OnInit {
  private readonly tagsService = inject(TagsService);
  private readonly bookmarkFiltersService = inject(BookmarkFiltersService);
  readonly tags = this.tagsService.tags;
  readonly isCreateTagModalOpened = signal<boolean>(false);
  readonly currentTagId = computed(() => this.bookmarkFiltersService.state().tagId);

  ngOnInit() {
    this.tagsService.getAll().subscribe();
  }

  public changeCurrentTag(tagId: string) {
    this.bookmarkFiltersService.toggleTag(tagId);
  }

  public isLoading(): boolean {
    return this.tagsService.isLoading();
  }

  public openCreateTagModal() {
    this.isCreateTagModalOpened.set(true);
  }

  public closeCreateTagModal() {
    this.isCreateTagModalOpened.set(false);
  }

  public createTag(data: CreateTagRequest) {
    this.tagsService.create(data).subscribe({
      next: () => this.closeCreateTagModal(),
    });
  }

  public deleteTag(id: string) {
    this.tagsService.delete(id).subscribe();
  }
}
