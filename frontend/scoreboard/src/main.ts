import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_CONFIG, appConfig } from './app/app.config';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // 👈 activa interceptores registrados en DI
    { provide: APP_CONFIG, useValue: appConfig },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // 👈 registra AuthInterceptor
  ]
}).catch(err => console.error(err));
