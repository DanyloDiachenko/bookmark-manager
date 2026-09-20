import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTagRequest } from '../../aside/tags/tags.types';
import { TagsService } from '../../aside/tags/tags.service';
import { getErrorMessage } from '../../../core/utils/error.utils';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-tag-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './create-tag-modal.html',
  styleUrl: './create-tag-modal.css',
  host: { class: 'contents' },
})
export class CreateTagModal {
  private readonly fb = inject(FormBuilder);
  private readonly tagsService = inject(TagsService);
  readonly isOpen = input<boolean>(true);
  readonly close = output<void>();
  readonly isSubmitting = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly tagForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
  });

  public onClose(): void {
    this.serverError.set(null);
    this.tagForm.reset({
      title: '',
    });
    this.close.emit();
  }

  public onSubmit(): void {
    this.serverError.set(null);

    if (this.tagForm.invalid) {
      this.tagForm.markAllAsTouched();
      return;
    }

    const { title } = this.tagForm.getRawValue();
    this.isSubmitting.set(true);

    this.tagsService
      .create({ title })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.onClose();
        },
        error: (err) => {
          this.serverError.set(getErrorMessage(err, 'Failed to create tag'));
        },
      });
  }
}
