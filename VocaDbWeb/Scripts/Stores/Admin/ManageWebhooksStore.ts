import WebhookContract, { WebhookEvents } from '@DataContracts/WebhookContract';
import AdminRepository from '@Repositories/AdminRepository';
import _ from 'lodash';
import { action, computed, makeObservable, observable } from 'mobx';

interface WebhookEventSelection {
	// Webhook event Id, for example "EntryReport"
	id: string;

	// User-visible webhook event name, for example "Entry report"
	name: string;

	selected: boolean;
}

class WebhookEventsEditStore {
	public readonly webhookEventSelections: WebhookEventSelection[];

	public constructor(
		webhookEventNames: { [key: string]: string },
		defaultWebhookEventName: string,
	) {
		makeObservable(this);

		var webhookEventSelections: WebhookEventSelection[] = [];
		for (var webhookEvent in webhookEventNames) {
			if (
				webhookEvent !== defaultWebhookEventName &&
				webhookEventNames.hasOwnProperty(webhookEvent)
			) {
				webhookEventSelections.push({
					id: webhookEvent,
					name: webhookEventNames[webhookEvent],
					selected: false,
				});
			}
		}

		this.webhookEventSelections = webhookEventSelections;
	}
}

class WebhookEditStore {
	public readonly url: string;
	public readonly webhookEvents: string;
	public readonly webhookEventsArray: string[];

	public readonly isNew: boolean;
	@observable public isDeleted = false;

	public constructor(webhook: WebhookContract, isNew: boolean) {
		makeObservable(this);

		this.url = webhook.url;
		this.webhookEvents = webhook.webhookEvents;
		this.webhookEventsArray = _.map(webhook.webhookEvents.split(','), (val) =>
			val.trim(),
		);
		this.isNew = isNew;
	}
}

export default class ManageWebhooksStore {
	@observable public newUrl = '';
	public readonly webhookEventsEditStore: WebhookEventsEditStore;
	@observable public webhooks: WebhookEditStore[] = [];

	public constructor(
		private readonly webhookEventNames: { [key: string]: string },
		private readonly adminRepo: AdminRepository,
	) {
		makeObservable(this);

		this.webhookEventsEditStore = new WebhookEventsEditStore(
			webhookEventNames,
			WebhookEvents[WebhookEvents.Default],
		);

		this.loadWebhooks();
	}

	@computed public get newWebhookEvents(): string {
		return _.chain(this.webhookEventsEditStore.webhookEventSelections)
			.filter((e) => e.selected)
			.map((e) => e.id)
			.value()
			.join(',');
	}

	@computed public get activeWebhooks(): WebhookEditStore[] {
		return _.filter(this.webhooks, (m) => !m.isDeleted);
	}

	private getEnumValues = <TEnum>(
		Enum: any,
		selected?: Array<TEnum>,
	): string[] =>
		Object.keys(Enum).filter(
			(k) =>
				(!selected || _.includes(selected, Enum[k])) &&
				typeof Enum[k as any] === 'number',
		);

	@action public loadWebhooks = async (): Promise<void> => {
		const result = await this.adminRepo.getWebhooks({});
		this.webhooks = _.map(result, (t) => new WebhookEditStore(t, false));
	};

	public translateWebhookEvent = (webhookEvent: string): string =>
		this.webhookEventNames[webhookEvent];

	@action public addWebhook = (): void => {
		if (!this.newUrl || !this.newWebhookEvents) return;

		if (_.some(this.webhooks, (w) => w.url === this.newUrl)) {
			// TODO: showErrorMessage
			return;
		}

		this.webhooks.push(
			new WebhookEditStore(
				{
					url: this.newUrl,
					webhookEvents: this.newWebhookEvents,
				},
				true,
			),
		);

		this.newUrl = '';
	};
}
