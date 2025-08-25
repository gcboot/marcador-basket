import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  hubUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

export const appConfig: AppConfig = {
  apiUrl: 'http://localhost:5071/api/games', 
  hubUrl: 'http://localhost:5071/hub/game'    };