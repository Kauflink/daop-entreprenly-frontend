import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

// ── Domain types ──────────────────────────────────────────────────────────────

interface HelpArticle {
  id: number;
  /** Clave i18n para el título: 'dashboard-help.articles.N.title' */
  titleKey: string;
  /** Clave i18n para la categoría mostrada: 'dashboard-help.articles.N.category' */
  categoryKey: string;
  /** Id de categoría para filtrado */
  categoryId: string;
  readTime: number;
  mostConsulted?: boolean;
  /** Claves i18n de cada paso: 'dashboard-help.articles.N.steps.0', etc. */
  stepKeys: string[];
  relatedIds: number[];
}

interface HelpCategory {
  id: string;
  /** Clave i18n para el nombre: 'dashboard-help.categoryNames.ID' */
  nameKey: string;
  articleCount: number;
}

type HelpView = 'home' | 'results' | 'article' | 'report' | 'success' | 'error';

// ── Static data (solo estructura; textos en i18n) ─────────────────────────────

const ARTICLES: HelpArticle[] = [
  {
    id: 1,
    titleKey:    'dashboard-help.articles.1.title',
    categoryKey: 'dashboard-help.articles.1.category',
    categoryId:  'inventario',
    readTime: 3,
    mostConsulted: true,
    stepKeys: [
      'dashboard-help.articles.1.steps.0',
      'dashboard-help.articles.1.steps.1',
      'dashboard-help.articles.1.steps.2',
      'dashboard-help.articles.1.steps.3',
    ],
    relatedIds: [4, 5],
  },
  {
    id: 2,
    titleKey:    'dashboard-help.articles.2.title',
    categoryKey: 'dashboard-help.articles.2.category',
    categoryId:  'chatbot',
    readTime: 5,
    mostConsulted: true,
    stepKeys: [
      'dashboard-help.articles.2.steps.0',
      'dashboard-help.articles.2.steps.1',
      'dashboard-help.articles.2.steps.2',
      'dashboard-help.articles.2.steps.3',
    ],
    relatedIds: [6, 7],
  },
  {
    id: 3,
    titleKey:    'dashboard-help.articles.3.title',
    categoryKey: 'dashboard-help.articles.3.category',
    categoryId:  'pedidos',
    readTime: 2,
    stepKeys: [
      'dashboard-help.articles.3.steps.0',
      'dashboard-help.articles.3.steps.1',
      'dashboard-help.articles.3.steps.2',
      'dashboard-help.articles.3.steps.3',
    ],
    relatedIds: [2, 8],
  },
  {
    id: 4,
    titleKey:    'dashboard-help.articles.4.title',
    categoryKey: 'dashboard-help.articles.4.category',
    categoryId:  'inventario',
    readTime: 5,
    stepKeys: [
      'dashboard-help.articles.4.steps.0',
      'dashboard-help.articles.4.steps.1',
      'dashboard-help.articles.4.steps.2',
      'dashboard-help.articles.4.steps.3',
    ],
    relatedIds: [1, 5],
  },
  {
    id: 5,
    titleKey:    'dashboard-help.articles.5.title',
    categoryKey: 'dashboard-help.articles.5.category',
    categoryId:  'ventas',
    readTime: 2,
    stepKeys: [
      'dashboard-help.articles.5.steps.0',
      'dashboard-help.articles.5.steps.1',
      'dashboard-help.articles.5.steps.2',
      'dashboard-help.articles.5.steps.3',
    ],
    relatedIds: [3, 1],
  },
  {
    id: 6,
    titleKey:    'dashboard-help.articles.6.title',
    categoryKey: 'dashboard-help.articles.6.category',
    categoryId:  'chatbot',
    readTime: 3,
    stepKeys: [
      'dashboard-help.articles.6.steps.0',
      'dashboard-help.articles.6.steps.1',
      'dashboard-help.articles.6.steps.2',
      'dashboard-help.articles.6.steps.3',
    ],
    relatedIds: [2, 3],
  },
  {
    id: 7,
    titleKey:    'dashboard-help.articles.7.title',
    categoryKey: 'dashboard-help.articles.7.category',
    categoryId:  'chatbot',
    readTime: 4,
    stepKeys: [
      'dashboard-help.articles.7.steps.0',
      'dashboard-help.articles.7.steps.1',
      'dashboard-help.articles.7.steps.2',
      'dashboard-help.articles.7.steps.3',
    ],
    relatedIds: [2, 3],
  },
  {
    id: 8,
    titleKey:    'dashboard-help.articles.8.title',
    categoryKey: 'dashboard-help.articles.8.category',
    categoryId:  'pedidos',
    readTime: 4,
    stepKeys: [
      'dashboard-help.articles.8.steps.0',
      'dashboard-help.articles.8.steps.1',
      'dashboard-help.articles.8.steps.2',
      'dashboard-help.articles.8.steps.3',
    ],
    relatedIds: [3, 2],
  },
  {
    id: 9,
    titleKey:    'dashboard-help.articles.9.title',
    categoryKey: 'dashboard-help.articles.9.category',
    categoryId:  'reportes',
    readTime: 3,
    stepKeys: [
      'dashboard-help.articles.9.steps.0',
      'dashboard-help.articles.9.steps.1',
      'dashboard-help.articles.9.steps.2',
      'dashboard-help.articles.9.steps.3',
    ],
    relatedIds: [5, 1],
  },
  {
    id: 10,
    titleKey:    'dashboard-help.articles.10.title',
    categoryKey: 'dashboard-help.articles.10.category',
    categoryId:  'suscripcion',
    readTime: 2,
    stepKeys: [
      'dashboard-help.articles.10.steps.0',
      'dashboard-help.articles.10.steps.1',
      'dashboard-help.articles.10.steps.2',
      'dashboard-help.articles.10.steps.3',
    ],
    relatedIds: [2, 9],
  },
];

/** Categorías calculadas dinámicamente desde los artículos reales */
const CATEGORIES: HelpCategory[] = (() => {
  const ids = [...new Set(ARTICLES.map(a => a.categoryId))];
  return ids.map(id => ({
    id,
    nameKey: `dashboard-help.categoryNames.${id}`,
    articleCount: ARTICLES.filter(a => a.categoryId === id).length,
  }));
})();

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-help',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class Help {
  private readonly translate = inject(TranslateService);

  // ── View state ──────────────────────────────────────────────────────────────
  protected readonly view                = signal<HelpView>('home');
  protected readonly searchInput         = signal('');
  protected readonly searchQuery         = signal('');
  protected readonly selectedArticleId   = signal<number | null>(null);
  protected readonly articleFeedback     = signal<'useful' | 'not-useful' | null>(null);
  protected readonly showQuickReport     = signal(false);
  protected readonly formSubmitted       = signal(false);
  protected readonly ticketNumber        = signal('');
  protected readonly savedData           = signal<{ category: string; module: string; description: string } | null>(null);
  protected readonly simulateError        = signal(false);
  protected readonly quickReportText      = signal('');
  protected readonly quickReportInvalid   = signal(false);

  // ── Static data ─────────────────────────────────────────────────────────────
  protected readonly articles        = ARTICLES;
  protected readonly categories      = CATEGORIES;
  protected readonly frequentArticles = ARTICLES.slice(0, 5);
  protected readonly popularArticles  = ARTICLES.filter(a => a.mostConsulted);

  // Las listas del formulario se leen desde i18n en tiempo de ejecución
  protected get problemCategories(): string[] {
    const result = this.translate.instant('dashboard-help.problemCategories');
    return Array.isArray(result) ? result : [];
  }

  protected get modules(): string[] {
    const result = this.translate.instant('dashboard-help.modules');
    return Array.isArray(result) ? result : [];
  }

  // ── Computed ────────────────────────────────────────────────────────────────
  protected readonly selectedArticle = computed(() =>
    ARTICLES.find(a => a.id === this.selectedArticleId()) ?? null,
  );

  protected readonly searchResults = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return ARTICLES.filter(a => {
      const title = this.translate.instant(a.titleKey).toLowerCase();
      const cat   = this.translate.instant(a.categoryKey).toLowerCase();
      return title.includes(q) || cat.includes(q);
    });
  });

  protected readonly relatedCategories = computed(() => {
    const ids = [...new Set(this.searchResults().map(a => a.categoryId))];
    return CATEGORIES.filter(c => ids.includes(c.id));
  });

  protected readonly relatedArticles = computed(() => {
    const art = this.selectedArticle();
    if (!art) return [];
    return art.relatedIds.map(id => ARTICLES.find(a => a.id === id)).filter(Boolean) as HelpArticle[];
  });

  // ── Report form ─────────────────────────────────────────────────────────────
  protected readonly reportForm = new FormGroup({
    category:    new FormControl('', [Validators.required, Validators.pattern(/^(?!-- ).+/)]),
    module:      new FormControl('', Validators.required),
    description: new FormControl('', [Validators.required, Validators.minLength(5)]),
    when:        new FormControl(''),
  });

  get fCategory()    { return this.reportForm.get('category')!; }
  get fModule()      { return this.reportForm.get('module')!; }
  get fDescription() { return this.reportForm.get('description')!; }

  protected get errorCount(): number {
    return [this.fCategory, this.fModule, this.fDescription].filter(
      c => c.invalid && (c.dirty || this.formSubmitted()),
    ).length;
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  protected onSearch(): void {
    const q = this.searchInput().trim();
    if (!q) return;
    this.searchQuery.set(q);
    this.view.set('results');
  }

  protected onClearSearch(): void {
    this.searchInput.set('');
    this.searchQuery.set('');
    this.view.set('home');
  }

  protected onOpenArticle(id: number): void {
    this.selectedArticleId.set(id);
    this.articleFeedback.set(null);
    this.showQuickReport.set(false);
    this.view.set('article');
  }

  protected onArticleFeedback(useful: boolean): void {
    this.articleFeedback.set(useful ? 'useful' : 'not-useful');
    if (!useful) this.showQuickReport.set(true);
  }

  protected onGoReport(prefillModuleKey?: string): void {
    this.reportForm.reset();
    this.formSubmitted.set(false);
    if (prefillModuleKey) {
      const translated = this.translate.instant(prefillModuleKey);
      this.reportForm.patchValue({ module: translated });
    }
    this.view.set('report');
  }

  protected onSubmitReport(): void {
    this.formSubmitted.set(true);
    if (this.reportForm.invalid) return;

    const val = this.reportForm.value;
    this.savedData.set({
      category:    val.category    ?? '',
      module:      val.module      ?? '',
      description: val.description ?? '',
    });

    if (this.simulateError()) {
      this.view.set('error');
    } else {
      const num = String(Math.floor(10000 + Math.random() * 89999));
      this.ticketNumber.set(`#TKT-2026-${num}`);
      this.view.set('success');
    }
  }

  protected onSubmitQuickReport(): void {
    if (!this.quickReportText().trim()) {
      this.quickReportInvalid.set(true);
      return;
    }
    const article = this.selectedArticle();
    const num = String(Math.floor(10000 + Math.random() * 89999));
    this.ticketNumber.set(`#TKT-2026-${num}`);
    this.savedData.set({
      category:    article ? this.translate.instant(article.categoryKey) : '',
      module:      article ? this.translate.instant(article.categoryKey) : '',
      description: this.quickReportText(),
    });
    this.view.set('success');
  }

  protected onRetry(): void       { this.view.set('report'); }

  protected onBackToHome(): void {
    this.view.set('home');
    this.selectedArticleId.set(null);
    this.searchInput.set('');
    this.searchQuery.set('');
    this.articleFeedback.set(null);
    this.showQuickReport.set(false);
    this.formSubmitted.set(false);
    this.reportForm.reset();
  }

  protected onBackToArticle(): void {
    this.articleFeedback.set(null);
    this.showQuickReport.set(false);
    this.quickReportText.set('');
    this.quickReportInvalid.set(false);
    this.view.set('article');
  }

  protected get nowString(): string {
    const lang   = this.translate.currentLang ?? this.translate.defaultLang ?? 'es';
    const locale = lang === 'en' ? 'en-US' : 'es-PE';
    return new Date().toLocaleDateString(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }) + ' · ' + new Date().toLocaleTimeString(locale, {
      hour: '2-digit', minute: '2-digit',
    });
  }

  protected isCategoryError():    boolean { const c = this.fCategory;    return c.invalid && (c.dirty || this.formSubmitted()); }
  protected isModuleError():      boolean { const c = this.fModule;      return c.invalid && (c.dirty || this.formSubmitted()); }
  protected isDescriptionError(): boolean { const c = this.fDescription; return c.invalid && (c.dirty || this.formSubmitted()); }

  protected highlightQuery(titleKey: string): string {
    const title = this.translate.instant(titleKey);
    const q = this.searchQuery().trim();
    if (!q) return title;
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return title.replace(new RegExp(`(${safe})`, 'gi'),
      '<mark class="bg-transparent text-orange-500 font-semibold not-italic">$1</mark>');
  }

  protected categoryBg(categoryId: string): string {
    const map: Record<string, string> = {
      inventario: 'bg-orange-100',
      chatbot:    'bg-blue-100',
      pedidos:    'bg-gray-100',
      ventas:     'bg-green-100',
      reportes:   'bg-purple-100',
      suscripcion:'bg-indigo-100',
      lotes:      'bg-yellow-100',
      configuracion: 'bg-slate-100',
    };
    return map[categoryId] ?? 'bg-gray-100';
  }

  protected get formErrors(): string[] {
    const errs: string[] = [];
    if (this.isCategoryError())    errs.push(this.translate.instant('dashboard-help.report.categoryRequired'));
    if (this.isDescriptionError()) errs.push(this.translate.instant('dashboard-help.report.descriptionRequired'));
    return errs;
  }
}
