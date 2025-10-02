import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;   // raíz de la API REST
  hubUrl: string;   // URL del Hub de SignalR
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

export const appConfig: AppConfig = {
  apiUrl: 'http://localhost:5071/api', 
  hubUrl: 'http://localhost:5071/hub/game'
};
