import { Component, inject } from '@angular/core';
import { FoldersService } from './folders.service';

@Component({
  selector: 'app-folders',
  imports: [],
  templateUrl: './folders.html',
  styleUrl: './folders.css',
})
export class Folders {
  readonly foldersService = inject(FoldersService);
  readonly folders = this.foldersService.folders();

  ngOnInit() {
    this.foldersService.getAll().subscribe();
  }
}
