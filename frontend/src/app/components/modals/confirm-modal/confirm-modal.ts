import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
  host: { class: 'contents' },
})
export class ConfirmModal {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('Confirm Action');
  readonly message = input<string>('Are you sure you want to proceed? This action cannot be undone.');
  readonly confirmButtonText = input<string>('Delete');
  readonly cancelButtonText = input<string>('Cancel');
  readonly isDanger = input<boolean>(true);
  readonly isSubmitting = input<boolean>(false);

  readonly confirm = output<void>();
  readonly close = output<void>();

  public onConfirm(): void {
    if (!this.isSubmitting()) {
      this.confirm.emit();
    }
  }

  public onClose(): void {
    if (!this.isSubmitting()) {
      this.close.emit();
    }
  }
}
