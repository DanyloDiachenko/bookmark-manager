import { Component, inject, OnInit, signal } from '@angular/core';
import { TagsService } from './tags.service';
import { CreateTagModal } from '../../modals/create-tag-modal/create-tag-modal';
import { CreateTagRequest } from './tags.types';

@Component({
  selector: 'app-tags',
  imports: [CreateTagModal],
  templateUrl: './tags.html',
  styleUrl: './tags.css',
})
export class Tags implements OnInit {
  readonly tagsService = inject(TagsService);
  readonly tags = this.tagsService.tags;
  readonly isCreateTagModalOpened = signal<boolean>(false);

  ngOnInit() {
    this.tagsService.getAll().subscribe();
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
