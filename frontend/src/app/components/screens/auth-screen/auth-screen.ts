import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from './auth.service';
import { getErrorMessage } from '../../../core/utils/error.utils';

@Component({
  selector: 'app-auth-screen',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-screen.html',
  host: { class: 'flex-1 flex flex-col min-h-0 overflow-y-auto' },
})
export class AuthScreen {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSignUp = signal(false);
  readonly isSubmitting = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly authForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    repeatPassword: [''],
  });

  public toggleMode(): void {
    this.isSignUp.update((v) => !v);
    this.serverError.set(null);
    this.authForm.reset({
      email: '',
      password: '',
      repeatPassword: '',
    });
  }

  public submit(): void {
    this.serverError.set(null);

    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const { email, password, repeatPassword } = this.authForm.getRawValue();

    if (this.isSignUp()) {
      if (password !== repeatPassword) {
        this.authForm.controls.repeatPassword.setErrors({
          passwordMismatch: true,
        });
        this.authForm.controls.repeatPassword.markAsTouched();

        return;
      }

      this.register(email, password);
      return;
    }

    this.login(email, password);
  }

  private login(email: string, password: string): void {
    this.isSubmitting.set(true);

    this.authService
      .login({ email, password })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.serverError.set(getErrorMessage(err, 'Invalid email or password'));
        },
      });
  }

  private register(email: string, password: string): void {
    this.isSubmitting.set(true);

    this.authService
      .register({
        email,
        password,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.serverError.set(getErrorMessage(err, 'Unable to create account'));
        },
      });
  }
}
