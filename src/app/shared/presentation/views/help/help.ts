import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
];

const CATEGORIES: HelpCategory[] = [
  { id: 'inventario',    nameKey: 'dashboard-help.categoryNames.inventario',    articleCount: 6 },
  { id: 'chatbot',       nameKey: 'dashboard-help.categoryNames.chatbot',        articleCount: 8 },
  { id: 'pedidos',       nameKey: 'dashboard-help.categoryNames.pedidos',        articleCount: 10 },
  { id: 'reportes',      nameKey: 'dashboard-help.categoryNames.reportes',       articleCount: 3 },
  { id: 'suscripcion',   nameKey: 'dashboard-help.categoryNames.suscripcion',    articleCount: 5 },
  { id: 'configuracion', nameKey: 'dashboard-help.categoryNames.configuracion',  articleCount: 2 },
];

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-help',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
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
  protected readonly simulateError       = signal(false);

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

  protected onGoReport(prefillModule?: string): void {
    this.reportForm.reset();
    this.formSubmitted.set(false);
    if (prefillModule) {
      this.reportForm.patchValue({ module: prefillModule });
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
    this.view.set('article');
  }

  protected get nowString(): string {
    return new Date().toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }) + ' · ' + new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  protected isCategoryError():    boolean { const c = this.fCategory;    return c.invalid && (c.dirty || this.formSubmitted()); }
  protected isModuleError():      boolean { const c = this.fModule;      return c.invalid && (c.dirty || this.formSubmitted()); }
  protected isDescriptionError(): boolean { const c = this.fDescription; return c.invalid && (c.dirty || this.formSubmitted()); }
}
