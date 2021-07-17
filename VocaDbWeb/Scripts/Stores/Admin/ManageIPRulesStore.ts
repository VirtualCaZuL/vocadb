import AdminRepository from '@Repositories/AdminRepository';
import _ from 'lodash';
import { action, makeObservable, observable } from 'mobx';
import moment from 'moment';

interface IPRuleContract {
	address?: string;

	created?: Date;

	id?: number;

	notes?: string;
}

class IPRule {
	@observable public address: string;
	public readonly created: Date;
	public readonly id: number;
	@observable public notes: string;

	public constructor(data: IPRuleContract) {
		makeObservable(this);

		this.address = data.address!;
		this.created = data.created!;
		this.id = data.id!;
		this.notes = data.notes!;
	}
}

export default class ManageIPRulesStore {
	@observable public bannedIPs: string[] = [];
	@action public setBannedIPs = (value: string[]): void => {
		this.bannedIPs = value;
	};

	@observable public newAddress = '';
	@observable public rules: IPRule[];

	public constructor(data: IPRuleContract[], adminRepo: AdminRepository) {
		makeObservable(this);

		const rules = _.chain(data)
			.sortBy('created')
			.reverse()
			.map((r) => new IPRule(r))
			.value();
		this.rules = rules;

		adminRepo.getTempBannedIps({}).then((result) => this.setBannedIPs(result));
	}

	@action public add = (): void => {
		const addr = this.newAddress.trim();

		if (!addr) return;

		if (_.some(this.rules, (r) => r.address === addr)) {
			// TODO: showErrorMessage
			return;
		}

		this.rules.unshift(
			new IPRule({ address: addr, notes: '', created: new Date() }),
		);
		this.newAddress = '';
	};

	@action public deleteOldRules = (): void => {
		const cutOff = moment().subtract(1, 'years').toDate();

		const toBeRemoved = _.filter(this.rules, (r) => r.created < cutOff);
		// TODO: this.rules.removeAll(toBeRemoved);
	};

	@action public remove = (rule: IPRule): void => {
		// TODO: this.rules.remove(rule);
	};

	public save = (): void => {
		// TODO: postJson
	};
}
