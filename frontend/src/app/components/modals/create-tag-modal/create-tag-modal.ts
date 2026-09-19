import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColorPickerDirective } from 'ngx-color-picker';

@Component({
  selector: 'app-create-tag-modal',
  imports: [ReactiveFormsModule, ColorPickerDirective],
  templateUrl: './create-tag-modal.html',
  styleUrl: './create-tag-modal.css',
  host: { class: 'contents' },
})
export class CreateTagModal {
  private readonly fb = inject(FormBuilder);

  readonly isOpen = input<boolean>(true);
  readonly close = output<void>();
  readonly createTag = output<{ title: string; color: string }>();

  readonly isSubmitting = signal(false);

  readonly defaultColors: string[] = [
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#64748B',
  ];

  readonly tagForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    color: ['#6366F1', [Validators.required]],
  });

  public selectPresetColor(color: string): void {
    this.tagForm.controls.color.setValue(color);
  }

  public onColorPickerChange(color: string): void {
    this.tagForm.controls.color.setValue(color);
  }

  public onClose(): void {
    this.close.emit();
  }

  public onSubmit(): void {
    if (this.tagForm.invalid) {
      this.tagForm.markAllAsTouched();
      return;
    }

    const { title, color } = this.tagForm.getRawValue();
    this.createTag.emit({ title: title.trim(), color });
  }
}
