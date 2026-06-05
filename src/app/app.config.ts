import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { I18nTitleStrategy } from './shared/infrastructure/i18n-title.strategy';
import { authInterceptor } from './auth/infrastructure/auth.interceptor';

import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
      lang: 'en',
      fallbackLang: 'en',
    }),
    { provide: TitleStrategy, useClass: I18nTitleStrategy },
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('entreprenly-lang');
      } catch {}
      translate.use(saved || translate.getBrowserLang() || 'en');
    }),
  ],
};
