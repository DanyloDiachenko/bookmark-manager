import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-auth-screen',
  imports: [],
  templateUrl: './auth-screen.html',
  host: { class: 'flex-1 flex flex-col min-h-0 overflow-y-auto' },
})
export class AuthScreen {
  isSignUp = signal(false);

  toggleMode() {
    this.isSignUp.update((val) => !val);
  }
}
