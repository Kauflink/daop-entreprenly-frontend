export class SubscriptionActivity {
  id: string;
  title: string;
  detail: string;

  constructor(activity?: Partial<SubscriptionActivity>) {
    this.id = activity?.id ?? '';
    this.title = activity?.title ?? '';
    this.detail = activity?.detail ?? '';
  }
}
