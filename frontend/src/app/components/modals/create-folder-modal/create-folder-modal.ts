import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColorPickerDirective } from 'ngx-color-picker';
import { CreateFolderRequest } from '../../aside/folders/folders.types';

@Component({
  selector: 'app-create-folder-modal',
  imports: [ReactiveFormsModule, ColorPickerDirective],
  templateUrl: './create-folder-modal.html',
  styleUrl: './create-folder-modal.css',
  host: { class: 'contents' },
})
export class CreateFolderModal {
  private readonly fb = inject(FormBuilder);
  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();
  readonly createFolder = output<CreateFolderRequest>();
  readonly isSubmitting = signal<boolean>(false);

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

  readonly folderForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    color: ['#6366F1', Validators.required],
  });

  public selectPresetColor(color: string): void {
    this.folderForm.controls.color.setValue(color);
  }

  public onColorPickerChange(color: string): void {
    this.folderForm.controls.color.setValue(color);
  }

  public onClose() {
    this.close.emit();
  }

  public onSubmit() {
    if (this.folderForm.invalid) {
      this.folderForm.markAllAsTouched();
      return;
    }

    const { title, color } = this.folderForm.getRawValue();
    this.createFolder.emit({ title, color });
  }
}
