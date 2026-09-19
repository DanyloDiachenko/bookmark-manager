import { Component, inject, OnInit, signal } from '@angular/core';
import { TagsService } from './tags.service';
import { CreateTagModal } from '../../modals/create-tag-modal/create-tag-modal';

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

  public openCreateTagModal() {
    this.isCreateTagModalOpened.set(true);
  }

  public closeCreateTagModal() {
    this.isCreateTagModalOpened.set(false);
  }

  public createTag(data: { title: string; color: string }) {
    this.tagsService.create({ title: data.title }).subscribe({
      next: () => this.closeCreateTagModal(),
    });
  }

  public deleteTag(id: string) {
    this.tagsService.delete(id).subscribe();
  }
}
