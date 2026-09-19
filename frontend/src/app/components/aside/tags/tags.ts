import { Component, inject, OnInit, signal } from '@angular/core';
import { TagsService } from './tags.service';
import { CreateTagModal } from '../../modals/create-tag-modal/create-tag-modal';
import { CreateTagRequest } from './tags.types';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-tags',
  imports: [CreateTagModal, NgClass],
  templateUrl: './tags.html',
  styleUrl: './tags.css',
})
export class Tags implements OnInit {
  readonly tagsService = inject(TagsService);
  readonly tags = this.tagsService.tags;
  readonly isCreateTagModalOpened = signal<boolean>(false);
  private readonly currentTagIdSignal = signal<string | null>(null);
  readonly currentTagId = this.currentTagIdSignal.asReadonly();

  ngOnInit() {
    this.tagsService.getAll().subscribe();
  }

  public changeCurrentTag(tagId: string) {
    this.currentTagIdSignal.update((tId) => (tId === tagId ? null : tagId));
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
