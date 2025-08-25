import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app/app';
import { APP_CONFIG, appConfig } from './app/app.config';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),
    provideAnimations(), // 👈 
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: APP_CONFIG, useValue: appConfig } 
  ]
}).catch(err => console.error(err));
