export class SubscriptionLimit {
  id: string;
  label: string;
  usedValue: number;
  maxValue: number;

  constructor(limit?: Partial<SubscriptionLimit>) {
    this.id = limit?.id ?? '';
    this.label = limit?.label ?? '';
    this.usedValue = limit?.usedValue ?? 0;
    this.maxValue = limit?.maxValue ?? 0;
  }

  get percentageUsed(): number {
    if (this.maxValue <= 0) {
      return 0;
    }

    return Math.min(Math.round((this.usedValue / this.maxValue) * 100), 100);
  }
}
