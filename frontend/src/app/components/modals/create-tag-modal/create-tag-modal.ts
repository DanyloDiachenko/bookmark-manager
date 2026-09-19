import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTagRequest } from '../../aside/tags/tags.types';

@Component({
  selector: 'app-create-tag-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './create-tag-modal.html',
  styleUrl: './create-tag-modal.css',
  host: { class: 'contents' },
})
export class CreateTagModal {
  private readonly fb = inject(FormBuilder);
  readonly isOpen = input<boolean>(true);
  readonly close = output<void>();
  readonly createTag = output<CreateTagRequest>();
  readonly isSubmitting = signal(false);
  readonly tagForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
  });

  public onClose(): void {
    this.close.emit();
  }

  public onSubmit(): void {
    if (this.tagForm.invalid) {
      this.tagForm.markAllAsTouched();
      return;
    }

    const { title } = this.tagForm.getRawValue();
    this.createTag.emit({ title });
  }
}
