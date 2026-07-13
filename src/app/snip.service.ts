import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SnipLink {
  code: string;
  url: string;
  shortUrl: string;
  hits: number;
  createdAt: string;
}

export interface CreateLinkRequest {
  url: string;
}

export interface ApiError {
  error: string;
}

@Injectable({ providedIn: 'root' })
export class SnipService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000';

  createLink(url: string): Observable<SnipLink> {
    return this.http.post<SnipLink>(`${this.baseUrl}/api/links`, { url });
  }

  getAllLinks(): Observable<SnipLink[]> {
    return this.http.get<SnipLink[]>(`${this.baseUrl}/api/links`);
  }
}
