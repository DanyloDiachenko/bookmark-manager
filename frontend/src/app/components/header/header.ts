import { Component, inject } from '@angular/core';
import { Search } from "./search/search";
import { Controls } from "./controls/controls";
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-header',
  imports: [Search, Controls],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly sidebarService = inject(SidebarService);

  public toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}
