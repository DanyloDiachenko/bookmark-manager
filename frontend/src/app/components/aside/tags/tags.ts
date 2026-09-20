import { Component, computed, inject, OnInit } from '@angular/core';
import { TagsService } from './tags.service';
import { NgClass } from '@angular/common';
import { BookmarkFiltersService } from '../../screens/bookmark-screen/bookmark-filters.service';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../screens/auth-screen/auth.service';
import { ITag } from './tags.types';

@Component({
  selector: 'app-tags',
  imports: [NgClass],
  templateUrl: './tags.html',
  styleUrl: './tags.css',
})
export class Tags implements OnInit {
  private readonly tagsService = inject(TagsService);
  private readonly bookmarkFiltersService = inject(BookmarkFiltersService);
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly tags = this.tagsService.tags;
  readonly currentTagId = computed(() => this.bookmarkFiltersService.state().tagId);

  ngOnInit() {
    this.tagsService.getAll().subscribe();
  }

  public changeCurrentTag(tagId: string) {
    this.bookmarkFiltersService.toggleTag(tagId);
    if (typeof window !== 'undefined' && window.innerWidth < 500) {
      this.sidebarService.close();
    }
  }

  public isLoading(): boolean {
    return this.tagsService.isLoading();
  }

  public openCreateTagModal() {
    this.tagsService.openCreateModal();
  }

  public promptDeleteTag(tag: ITag): void {
    this.tagsService.promptDelete(tag);
  }
}
