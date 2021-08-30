import { ArtistAutoCompleteParams } from '@Components/KnockoutExtensions/AutoCompleteParams';
import ArtistContract from '@DataContracts/Artist/ArtistContract';
import ArtistRepository from '@Repositories/ArtistRepository';
import GlobalValues from '@Shared/GlobalValues';
import { makeObservable, observable, runInAction } from 'mobx';

export default class RequestVerificationStore {
	@observable public privateMessage = false;
	@observable public selectedArtist?: ArtistContract;

	public constructor(
		private readonly values: GlobalValues,
		private readonly artistRepo: ArtistRepository,
	) {
		makeObservable(this);
	}

	public clearArtist = (): void => {
		this.selectedArtist = undefined;
	};

	public setArtist = (targetArtistId?: number): void => {
		this.artistRepo
			.getOne({
				id: targetArtistId!,
				lang: this.values.languagePreference,
			})
			.then((artist) =>
				runInAction(() => {
					this.selectedArtist = artist;
				}),
			);
	};

	public artistSearchParams: ArtistAutoCompleteParams = {
		acceptSelection: this.setArtist,
	};
}
