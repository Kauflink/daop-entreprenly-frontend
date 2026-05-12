import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

// ── Domain types ──────────────────────────────────────────────────────────────

interface HelpArticle {
  id: number;
  title: string;
  category: string;
  categoryId: string;
  readTime: number;
  mostConsulted?: boolean;
  steps: string[];
  relatedIds: number[];
}

interface HelpCategory {
  id: string;
  name: string;
  articleCount: number;
}

type HelpView = 'home' | 'results' | 'article' | 'report' | 'success' | 'error';

// ── Static data ───────────────────────────────────────────────────────────────

const ARTICLES: HelpArticle[] = [
  {
    id: 1,
    title: '¿Cómo agregar un producto al inventario?',
    category: 'Inventario',
    categoryId: 'inventario',
    readTime: 3,
    mostConsulted: true,
    steps: [
      'Ve al módulo <strong>Inventario</strong> en el panel lateral.',
      'Selecciona "Productos" y luego haz clic en <strong>Agregar producto</strong>.',
      'Completa el formulario: nombre, precio y stock inicial.',
      'Guarda los cambios — el producto aparecerá en el catálogo de inmediato.',
    ],
    relatedIds: [4, 5],
  },
  {
    id: 2,
    title: '¿Cómo conectar el chatbot de WhatsApp?',
    category: 'Chatbot',
    categoryId: 'chatbot',
    readTime: 5,
    mostConsulted: true,
    steps: [
      'Ve al módulo <strong>Chatbot</strong> en el panel de configuración.',
      'Pulsa <strong>"Conectar WhatsApp"</strong> para mostrar el código QR.',
      'Escanea el código QR desde tu app de <strong>WhatsApp Business</strong> en tu teléfono.',
      '¡Listo! El chatbot ya está activo y puede recibir y responder mensajes.',
    ],
    relatedIds: [6, 7],
  },
  {
    id: 3,
    title: '¿Cómo validar un pago desde el dashboard?',
    category: 'Pedidos y Pago',
    categoryId: 'pedidos',
    readTime: 2,
    steps: [
      'Accede al módulo <strong>Pedidos</strong> desde el panel lateral.',
      'Filtra los pedidos con estado "Esperando comprobante".',
      'Abre el pedido y revisa la imagen del comprobante enviado.',
      'Pulsa <strong>Aprobar pago</strong> si es válido, o <strong>Rechazar</strong> con un motivo.',
    ],
    relatedIds: [2, 8],
  },
  {
    id: 4,
    title: '¿Cómo gestionar fechas de caducidad en lotes?',
    category: 'Lotes',
    categoryId: 'inventario',
    readTime: 5,
    steps: [
      'Ve al módulo <strong>Inventario</strong> y selecciona la pestaña <strong>Lotes</strong>.',
      'Revisa la columna "Fecha de vencimiento" — los próximos a vencer están resaltados.',
      'Los lotes críticos generan <strong>alertas de stock</strong> automáticamente en el home.',
      'Edita un lote para ajustar la fecha o la cantidad disponible.',
    ],
    relatedIds: [1, 5],
  },
  {
    id: 5,
    title: '¿Cómo consultar el resumen de caja diario?',
    category: 'Ventas · Caja',
    categoryId: 'ventas',
    readTime: 2,
    steps: [
      'Ve al módulo <strong>Ventas</strong> desde el panel lateral.',
      'El resumen de caja aparece en el panel lateral derecho.',
      'Muestra el <strong>Total del día</strong>, Efectivo y Yape/Plin por separado.',
      'Se actualiza automáticamente con cada venta finalizada.',
    ],
    relatedIds: [3, 1],
  },
  {
    id: 6,
    title: '¿Qué hacer si el chatbot se desconecta?',
    category: 'Chatbot',
    categoryId: 'chatbot',
    readTime: 3,
    steps: [
      'Ve al módulo <strong>Chatbot</strong> — verás un aviso de "Sesión expirada" en rojo.',
      'Pulsa <strong>"Volver a vincular"</strong> para iniciar la reconexión.',
      'Escanea el nuevo código QR desde tu WhatsApp Business.',
      'El chatbot retomará su actividad con normalidad.',
    ],
    relatedIds: [2, 3],
  },
  {
    id: 7,
    title: '¿El chatbot puede enviar comprobantes automáticamente?',
    category: 'Chatbot',
    categoryId: 'chatbot',
    readTime: 4,
    steps: [
      'El chatbot <strong>recibe</strong> comprobantes enviados por los clientes vía WhatsApp.',
      'Los muestra automáticamente en el módulo <strong>Pedidos</strong> del dashboard.',
      'El comerciante debe <strong>validarlos manualmente</strong> — el sistema no los aprueba solo.',
      'Tras la validación, el cliente recibe una confirmación automática por WhatsApp.',
    ],
    relatedIds: [2, 3],
  },
  {
    id: 8,
    title: '¿Cómo validar un pago?',
    category: 'Pedidos y Pagos',
    categoryId: 'pedidos',
    readTime: 4,
    steps: [
      'Accede al módulo <strong>Pedidos</strong>.',
      'Selecciona el pedido pendiente de validación.',
      'Revisa el comprobante adjunto por el cliente.',
      'Aprueba o rechaza el pago según corresponda.',
    ],
    relatedIds: [3, 2],
  },
];

const CATEGORIES: HelpCategory[] = [
  { id: 'inventario', name: 'Inventario', articleCount: 6 },
  { id: 'chatbot', name: 'Chatbot', articleCount: 8 },
  { id: 'pedidos', name: 'Pedidos y Pagos', articleCount: 10 },
  { id: 'reportes', name: 'Reportes', articleCount: 3 },
  { id: 'suscripcion', name: 'Suscripción', articleCount: 5 },
  { id: 'configuracion', name: 'Configuración', articleCount: 2 },
];

const PROBLEM_CATEGORIES = [
  '-- Selecciona una categoría --',
  'Inventario / Productos',
  'Chatbot / WhatsApp',
  'Pedidos y Pagos',
  'Ventas y Caja',
  'Suscripción',
  'Reportes',
  'Configuración',
  'Otro',
];

const MODULES = ['Inventario', 'Chatbot', 'Pedidos', 'Ventas', 'Suscripción', 'Reportes', 'Configuración', 'General'];

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-help',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class Help {
  // ── View state ──────────────────────────────────────────────────────────────
  protected readonly view = signal<HelpView>('home');
  protected readonly searchInput = signal('');
  protected readonly searchQuery = signal('');
  protected readonly selectedArticleId = signal<number | null>(null);
  protected readonly articleFeedback = signal<'useful' | 'not-useful' | null>(null);
  protected readonly showQuickReport = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly ticketNumber = signal('');
  protected readonly savedData = signal<{ category: string; module: string; description: string } | null>(null);
  protected readonly simulateError = signal(false); // flip to true to demo error scenario

  // ── Static data ─────────────────────────────────────────────────────────────
  protected readonly articles = ARTICLES;
  protected readonly categories = CATEGORIES;
  protected readonly frequentArticles = ARTICLES.slice(0, 5);
  protected readonly popularArticles = ARTICLES.filter(a => a.mostConsulted);
  protected readonly problemCategories = PROBLEM_CATEGORIES;
  protected readonly modules = MODULES;

  // ── Computed ────────────────────────────────────────────────────────────────
  protected readonly selectedArticle = computed(() =>
    ARTICLES.find(a => a.id === this.selectedArticleId()) ?? null,
  );

  protected readonly searchResults = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return ARTICLES.filter(
      a => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
    );
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
    category: new FormControl('', [Validators.required, Validators.pattern(/^(?!-- Selecciona).+/)]),
    module: new FormControl('', Validators.required),
    description: new FormControl('', [Validators.required, Validators.minLength(5)]),
    when: new FormControl(''),
  });

  get fCategory() { return this.reportForm.get('category')!; }
  get fModule() { return this.reportForm.get('module')!; }
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
      category: val.category ?? '',
      module: val.module ?? '',
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

  protected onRetry(): void {
    this.view.set('report');
  }

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

  protected isCategoryError(): boolean {
    const c = this.fCategory;
    return c.invalid && (c.dirty || this.formSubmitted());
  }

  protected isModuleError(): boolean {
    const c = this.fModule;
    return c.invalid && (c.dirty || this.formSubmitted());
  }

  protected isDescriptionError(): boolean {
    const c = this.fDescription;
    return c.invalid && (c.dirty || this.formSubmitted());
  }
}
