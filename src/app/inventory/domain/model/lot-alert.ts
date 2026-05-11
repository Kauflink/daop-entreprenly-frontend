import { UnitProduct } from './unit-product.entity';
import { WeightProduct } from './weight-product.entity';
import { UnitLot } from './unit-lot.entity';
import { WeightLot } from './weight-lot.entity';

export type LotAlertKind = 'expired' | 'outOfStock' | 'expiringSoon' | 'lowStock';
export type LotAlertTone = 'danger' | 'warning' | 'low';
export type LotAlertProductType = 'unit' | 'weight';

export interface InventoryLotAlert {
  kind: LotAlertKind;
  tone: LotAlertTone;
  icon: string;
  priority: number;
  productId: number;
  productType: LotAlertProductType;
  productName: string;
  lotId: number | null;
  detailKey: string;
  detailParams: Record<string, string | number>;
}

export interface InventoryLotAlertSummary {
  kind: LotAlertKind;
  tone: LotAlertTone;
  icon: string;
  priority: number;
  count: number;
  titleKey: string;
  titleParams: Record<string, string | number>;
  detailKey: string;
  detailParams: Record<string, string | number>;
}

const EXPIRING_SOON_DAYS = 5;
const LOW_UNIT_STOCK_THRESHOLD = 5;
const LOW_WEIGHT_STOCK_THRESHOLD = 5;

export function buildInventoryLotAlerts(
  unitProducts: UnitProduct[],
  weightProducts: WeightProduct[],
  unitLots: UnitLot[],
  weightLots: WeightLot[],
  now = new Date()
): InventoryLotAlert[] {
  const today = startOfDay(now);
  const alerts: InventoryLotAlert[] = [];

  for (const product of unitProducts) {
    const productLots = unitLots.filter(lot => lot.productId === product.id);
    const totalStock = productLots.reduce((sum, lot) => sum + Number(lot.quantity || 0), 0);
    const outLots = productLots.filter(lot => Number(lot.quantity || 0) <= 0);

    for (const lot of outLots) {
      alerts.push(createAlert('outOfStock', product, 'unit', lot.id, 'lots.alerts.detail.outOfStock'));
    }

    if (outLots.length === 0 && totalStock <= 0) {
      alerts.push(createAlert('outOfStock', product, 'unit', null, 'lots.alerts.detail.outOfStockNoLot'));
    }

    if (totalStock > 0 && totalStock <= LOW_UNIT_STOCK_THRESHOLD) {
      const lot = productLots[0];
      alerts.push(createAlert(
        'lowStock',
        product,
        'unit',
        lot?.id ?? null,
        lot ? 'lots.alerts.detail.lowStock' : 'lots.alerts.detail.lowStockNoLot'
      ));
    }

    for (const lot of productLots) {
      const expiryDate = startOfDay(new Date(lot.expiryDate));
      if (Number.isNaN(expiryDate.getTime())) continue;

      const daysUntilExpiry = daysBetween(today, expiryDate);
      if (daysUntilExpiry < 0) {
        alerts.push(createAlert('expired', product, 'unit', lot.id, 'lots.alerts.detail.expired', {
          expiryDate: formatDate(expiryDate)
        }));
      } else if (daysUntilExpiry <= EXPIRING_SOON_DAYS) {
        alerts.push(createAlert(
          'expiringSoon',
          product,
          'unit',
          lot.id,
          'lots.alerts.detail.expiringSoon',
          {
            days: daysUntilExpiry,
            expiryDate: formatDate(expiryDate)
          }
        ));
      }
    }
  }

  for (const product of weightProducts) {
    const productLots = weightLots.filter(lot => lot.productId === product.id);
    const totalStock = productLots.reduce((sum, lot) => sum + Number(lot.quantityKg || 0), 0);
    const outLots = productLots.filter(lot => Number(lot.quantityKg || 0) <= 0);

    for (const lot of outLots) {
      alerts.push(createAlert('outOfStock', product, 'weight', lot.id, 'lots.alerts.detail.outOfStock'));
    }

    if (outLots.length === 0 && totalStock <= 0) {
      alerts.push(createAlert('outOfStock', product, 'weight', null, 'lots.alerts.detail.outOfStockNoLot'));
    }

    if (totalStock > 0 && totalStock <= LOW_WEIGHT_STOCK_THRESHOLD) {
      const lot = productLots[0];
      alerts.push(createAlert(
        'lowStock',
        product,
        'weight',
        lot?.id ?? null,
        lot ? 'lots.alerts.detail.lowStock' : 'lots.alerts.detail.lowStockNoLot'
      ));
    }
  }

  return alerts.sort((a, b) => a.priority - b.priority);
}

export function summarizeLotAlerts(alerts: InventoryLotAlert[]): InventoryLotAlertSummary[] {
  const summaries: InventoryLotAlertSummary[] = [];

  const kinds: LotAlertKind[] = ['expired', 'outOfStock', 'expiringSoon', 'lowStock'];

  for (const kind of kinds) {
    const byKind = alerts.filter(a => a.kind === kind);
    if (byKind.length === 0) continue;

    const keys = [...new Set(byKind.map(a => `${a.productType}:${a.productId}`))];

    for (const key of keys) {
      const [productType, productIdStr] = key.split(':');
      const productId = Number(productIdStr);
      const group = byKind.filter(a => a.productId === productId && a.productType === productType);
      const first = group[0];

      summaries.push({
        kind,
        tone: first.tone,
        icon: first.icon,
        priority: first.priority,
        count: group.length,
        titleKey: `lots.alerts.title.${kind}`,
        titleParams: { count: group.length },
        detailKey: first.detailKey,
        detailParams: first.detailParams
      });
    }
  }

  return summaries.sort((a, b) => a.priority - b.priority);
}

function createAlert(
  kind: LotAlertKind,
  product: UnitProduct | WeightProduct,
  productType: LotAlertProductType,
  lotId: number | null,
  detailKey: string,
  extraDetailParams: Record<string, string | number> = {}
): InventoryLotAlert {
  const meta = alertMeta(kind);
  const lotLabel = lotId === null ? '' : `#${lotId}`;

  return {
    kind,
    tone: meta.tone,
    icon: meta.icon,
    priority: meta.priority,
    productId: product.id,
    productType,
    productName: product.name,
    lotId,
    detailKey,
    detailParams: {
      productName: product.name,
      lotId: lotLabel,
      ...extraDetailParams
    }
  };
}

function alertMeta(kind: LotAlertKind): { tone: LotAlertTone; icon: string; priority: number } {
  switch (kind) {
    case 'expired':
      return { tone: 'danger', icon: 'error_outline', priority: 1 };
    case 'outOfStock':
      return { tone: 'danger', icon: 'priority_high', priority: 2 };
    case 'expiringSoon':
      return { tone: 'warning', icon: 'warning_amber', priority: 3 };
    case 'lowStock':
      return { tone: 'low', icon: 'trending_down', priority: 4 };
  }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
}

function formatDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
