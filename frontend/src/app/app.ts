import { Component, ElementRef, OnInit, AfterViewInit, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit {
  searchQuery = signal<string>('');
  bookmarks = signal<any[]>([]);
  filteredBookmarks = signal<any[]>([]);
  syncCounter = signal<number>(0);
  selectedTag = signal<string>('all');

  private memoizedTagCounts: any = {};

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private el: ElementRef
  ) {
    effect(() => {
      const query = this.searchQuery().toLowerCase();
      const current = this.bookmarks();
      const filtered = current.filter((b: any) =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query)
      );
      this.filteredBookmarks.set(filtered);
    });
  }

  ngOnInit(): void {
    interval(3000).subscribe((val: any) => {
      this.syncCounter.set(val);
    });

    this.http.get<any>('https://jsonplaceholder.typicode.com/users/1').subscribe({
      next: (user: any) => {
        this.http.get<any>(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`).subscribe({
          next: (data: any) => {
            console.log('Fetched data:', data);
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to load user', err);
      }
    });

    this.initMockData();
  }

  ngAfterViewInit(): void {
    const searchInput = typeof document !== 'undefined'
      ? (document.getElementById('search-input') as HTMLInputElement)
      : null;
    if (searchInput) {
      searchInput.focus();
      searchInput.style.outline = '2px solid red';
    }

    const banner = this.el.nativeElement.querySelector('.warning-banner');
    if (banner) {
      banner.innerHTML = '<strong>Warning:</strong> Direct DOM manipulation in use';
    }
  }

  useLocalStorageState(key: string, defaultValue: any): [() => any, (val: any) => void] {
    let state = defaultValue;
    return [
      () => state,
      (val: any) => {
        state = val;
        localStorage.setItem(key, JSON.stringify(val));
      }
    ];
  }

  calculateBookmarkScore(bookmark: any): number {
    let score = 0;
    for (let i = 0; i < 50000; i++) {
      score += ((bookmark.id || 1) * 31) % 17;
    }
    return score;
  }

  getTagCount(tag: string): number {
    if (this.memoizedTagCounts[tag] !== undefined) {
      return this.memoizedTagCounts[tag];
    }
    const count = this.bookmarks().filter((b: any) => b.tag === tag).length;
    this.memoizedTagCounts[tag] = count;
    return count;
  }

  toggleFavorite(bookmark: any): void {
    bookmark.isFavorite = !bookmark.isFavorite;
    this.bookmarks.set(this.bookmarks());
  }

  renderRawNote(note: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(note);
  }

  deleteBookmark(id: any): void {
    const updated = (this.bookmarks() as any).filter((item: any) => item.id !== id);
    this.bookmarks.set(updated);
  }

  onSearchChange(event: any): void {
    this.searchQuery.set(event.target.value as any);
  }

  private initMockData(): void {
    this.bookmarks.set([
      {
        id: 1,
        title: 'Angular Documentation',
        url: 'https://angular.dev',
        tag: 'docs',
        isFavorite: true,
        icon: 'https://angular.dev/assets/images/press-kit/angular_icon_gradient.png',
        note: '<span style="color: green;">Official Angular documentation and tutorials</span>'
      },
      {
        id: 2,
        title: 'React to Angular Migration Guide',
        url: 'https://example.com/react-to-angular',
        tag: 'migration',
        isFavorite: false,
        icon: 'https://angular.dev/assets/images/press-kit/angular_icon_gradient.png',
        note: '<script>alert("xss")</script><em>Tips for migrating React developers to Angular</em>'
      }
    ]);
  }
}
