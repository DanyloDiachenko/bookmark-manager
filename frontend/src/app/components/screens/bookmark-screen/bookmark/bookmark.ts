import { Component, input } from '@angular/core';
import { IBookmark } from '../bookmarks.types';

@Component({
  selector: 'app-bookmark',
  imports: [],
  templateUrl: './bookmark.html',
  styleUrl: './bookmark.css',
})
export class Bookmark {
  readonly bookmark = input.required<IBookmark>();
}
