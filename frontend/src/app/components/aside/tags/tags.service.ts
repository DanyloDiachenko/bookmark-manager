import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { CreateTagRequest, ITag } from './tags.types';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private readonly http = inject(HttpClient);
  private readonly tagsSignal = signal<ITag[]>([]);
  private readonly isLoadingSignal = signal<boolean>(false);
  readonly tags = this.tagsSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  public getAll(): Observable<ITag[]> {
    this.isLoadingSignal.set(true);
    return this.http.get<ITag[]>(`/api/tags`).pipe(
      tap((tags) => this.tagsSignal.set(tags)),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }

  public create(payload: CreateTagRequest): Observable<ITag> {
    this.isLoadingSignal.set(true);
    return this.http.post<ITag>('/api/tags', payload).pipe(
      tap((tag) => this.tagsSignal.update((tags) => [...tags, tag])),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }

  public delete(id: string): Observable<void> {
    this.isLoadingSignal.set(true);
    return this.http.delete<void>(`/api/tags/${id}`).pipe(
      tap(() => this.tagsSignal.update((tags) => tags.filter((t) => t.id !== id))),
      finalize(() => this.isLoadingSignal.set(false)),
    );
  }
}
