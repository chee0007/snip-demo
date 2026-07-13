import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should validate URLs correctly', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    app.url.set('https://example.com');
    expect(app.isValidUrl()).toBe(true);
    
    app.url.set('http://example.com');
    expect(app.isValidUrl()).toBe(true);
    
    app.url.set('ftp://example.com');
    expect(app.isValidUrl()).toBe(false);
    
    app.url.set('not-a-url');
    expect(app.isValidUrl()).toBe(false);
  });
});
