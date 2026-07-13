import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnipService, SnipLink } from './snip.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private snipService = inject(SnipService);

  url = signal('');
  links = signal<SnipLink[]>([]);
  createdLink = signal<SnipLink | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.loadLinks();
  }

  isValidUrl(): boolean {
    const urlString = this.url();
    if (!urlString) return false;
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  createShortLink() {
    if (!this.isValidUrl()) {
      this.error.set('Please enter a valid http or https URL');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.createdLink.set(null);

    this.snipService.createLink(this.url()).subscribe({
      next: (link) => {
        this.createdLink.set(link);
        this.url.set('');
        this.loading.set(false);
        this.loadLinks();
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Failed to create short link');
        this.loading.set(false);
      }
    });
  }

  loadLinks() {
    this.snipService.getAllLinks().subscribe({
      next: (links) => {
        this.links.set(links);
      },
      error: (err) => {
        console.error('Failed to load links:', err);
      }
    });
  }
}
