import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateBookmarkRequest } from '../../screens/bookmark-screen/bookmarks.types';
import { NgSelectModule } from '@ng-select/ng-select';
import { FoldersService } from '../../aside/folders/folders.service';
import { TagsService } from '../../aside/tags/tags.service';

@Component({
  selector: 'app-create-bookmark-modal',
  imports: [ReactiveFormsModule, NgSelectModule],
  templateUrl: './create-bookmark-modal.html',
  styleUrl: './create-bookmark-modal.css',
  host: { class: 'contents' },
})
export class CreateBookmarkModal {
  private readonly fb = inject(FormBuilder);
  private readonly foldersService = inject(FoldersService);
  private readonly tagsService = inject(TagsService);
  readonly folders = this.foldersService.folders;
  readonly tags = this.tagsService.tags;

  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();
  readonly createBookmark = output<CreateBookmarkRequest>();
  readonly isSubmitting = signal<boolean>(false);

  readonly bookmarkForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    url: ['', [Validators.required]],
    description: ['', []],
    folderId: [undefined, []],
    tagIds: [[] as string[], []],
    isStarred: [false],
    isReadLater: [false],
  });

  public onClose() {
    this.bookmarkForm.reset({
      url: '',
      title: '',
      description: '',
      folderId: undefined,
      tagIds: [],
      isStarred: false,
      isReadLater: false,
    });
    this.close.emit();
  }

  public onSubmit() {
    if (this.bookmarkForm.invalid) {
      this.bookmarkForm.markAllAsTouched();
      return;
    }

    const val = this.bookmarkForm.getRawValue();

    const request: CreateBookmarkRequest = {
      url: val.url,
      title: val.title,
      description: val.description,
      folderId: val.folderId || undefined,
      tagIds: val.tagIds && val.tagIds.length > 0 ? val.tagIds : undefined,
      isStarred: val.isStarred ?? false,
      isReadLater: val.isReadLater ?? false,
    };
    this.createBookmark.emit(request);
  }
}
