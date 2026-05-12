import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class I18nTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);
  private currentKey = '';

  constructor() {
    super();
    this.translate.onLangChange.subscribe(() => {
      this.applyTitle(this.currentKey);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.currentKey = this.buildTitle(snapshot) ?? '';
    this.applyTitle(this.currentKey);
  }

  private applyTitle(key: string): void {
    if (!key) {
      this.title.setTitle('Entreprenly');
      return;
    }
    this.translate.get(key).subscribe((translated: string) => {
      this.title.setTitle(`Entreprenly - ${translated}`);
    });
  }
}
