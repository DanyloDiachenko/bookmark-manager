import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  public get(name: string): string | null {
    if (!this.isBrowser || typeof document === 'undefined') {
      return null;
    }

    const match = document.cookie.match(new RegExp('(^|;\\s*)' + encodeURIComponent(name) + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  public set(name: string, value: string, days = 7, path = '/'): void {
    if (!this.isBrowser || typeof document === 'undefined') {
      return;
    }

    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=Lax`;
  }

  public delete(name: string, path = '/'): void {
    if (!this.isBrowser || typeof document === 'undefined') {
      return;
    }

    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
  }

  public has(name: string): boolean {
    return this.get(name) !== null;
  }
}
