import UserKnownLanguageContract from '@DataContracts/User/UserKnownLanguageContract';
import WebLinkContract from '@DataContracts/WebLinkContract';
import UserRepository from '@Repositories/UserRepository';
import WebLinksEditStore from '@Stores/WebLinksEditStore';
import _ from 'lodash';
import { action, computed, makeObservable, observable } from 'mobx';

class UserKnownLanguageEditStore {
	@observable public cultureCode: string;
	@observable public proficiency: string;

	public constructor(contract?: UserKnownLanguageContract) {
		makeObservable(this);

		this.cultureCode = contract?.cultureCode ?? '';
		this.proficiency = contract?.proficiency ?? '';
	}
}

export default class MySettingsStore {
	@observable public aboutMe: string;
	@observable public email: string;
	@observable public emailVerified: boolean;
	@observable public emailVerificationSent = false;
	@observable public knownLanguages: UserKnownLanguageEditStore[];
	public readonly webLinksStore: WebLinksEditStore;

	public constructor(
		private readonly userRepo: UserRepository,
		aboutMe: string,
		email: string,
		emailVerified: boolean,
		webLinkContracts: WebLinkContract[],
		knownLanguages: UserKnownLanguageContract[],
	) {
		this.aboutMe = aboutMe;
		this.email = email;
		this.emailVerified = emailVerified;
		this.knownLanguages = _.map(
			knownLanguages,
			(l) => new UserKnownLanguageEditStore(l),
		);
		this.webLinksStore = new WebLinksEditStore(webLinkContracts);
	}

	// TODO: support showing the verification button by saving email immediately after it's changed
	@computed public get canVerifyEmail(): boolean {
		return !!this.email && !this.emailVerified && !this.emailVerificationSent;
	}

	@action public addKnownLanguage = (): void => {
		this.knownLanguages.push(new UserKnownLanguageEditStore());
	};

	@action public verifyEmail = (): void => {
		this.emailVerificationSent = true;
		this.userRepo.requestEmailVerification({}).then(() => {
			// TODO: ui.showSuccessMessage
		});
	};
}
