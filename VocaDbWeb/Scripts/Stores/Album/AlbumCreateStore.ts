import { ArtistAutoCompleteParams } from '@Components/KnockoutExtensions/AutoCompleteParams';
import ArtistContract from '@DataContracts/Artist/ArtistContract';
import DuplicateEntryResultContract from '@DataContracts/DuplicateEntryResultContract';
import AlbumRepository from '@Repositories/AlbumRepository';
import ArtistRepository from '@Repositories/ArtistRepository';
import GlobalValues from '@Shared/GlobalValues';
import _ from 'lodash';
import { action, makeObservable, observable, runInAction } from 'mobx';

export default class AlbumCreateStore {
	@observable public artists: ArtistContract[] = [];
	@observable public dupeEntries: DuplicateEntryResultContract[] = [];
	@observable public nameOriginal = '';
	@observable public nameRomaji = '';
	@observable public nameEnglish = '';
	@observable public submitting = false;

	public constructor(
		private readonly values: GlobalValues,
		private readonly albumRepo: AlbumRepository,
		private readonly artistRepo: ArtistRepository,
	) {
		makeObservable(this);
	}

	private addArtist = (artistId?: number): void => {
		if (artistId) {
			this.artistRepo
				.getOne({ id: artistId, lang: this.values.languagePreference })
				.then((artist) =>
					runInAction(() => {
						this.artists.push(artist);
					}),
				);
		}
	};

	public artistSearchParams: ArtistAutoCompleteParams = {
		acceptSelection: this.addArtist,
	};

	public checkDuplicates = (): void => {
		const term1 = this.nameOriginal;
		const term2 = this.nameRomaji;
		const term3 = this.nameEnglish;

		this.albumRepo
			.findDuplicate({
				params: { term1: term1, term2: term2, term3: term3 },
			})
			.then((result) =>
				runInAction(() => {
					this.dupeEntries = result;
				}),
			);
	};

	@action public removeArtist = (artist: ArtistContract): void => {
		_.pull(this.artists, artist);
	};

	@action public submit = (): boolean => {
		this.submitting = true;
		return true;
	};
}
