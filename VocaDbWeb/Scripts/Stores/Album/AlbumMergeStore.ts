import { ArtistAutoCompleteParams } from '@Components/KnockoutExtensions/AutoCompleteParams';
import AlbumContract from '@DataContracts/Album/AlbumContract';
import EntryMergeValidationHelper from '@Helpers/EntryMergeValidationHelper';
import AlbumRepository from '@Repositories/AlbumRepository';
import GlobalValues from '@Shared/GlobalValues';
import BasicEntryLinkStore from '@Stores/BasicEntryLinkStore';
import { makeObservable, observable, runInAction } from 'mobx';

export default class AlbumMergeStore {
	public target: BasicEntryLinkStore<AlbumContract>;
	public targetSearchParams: ArtistAutoCompleteParams;

	@observable public validationError_targetIsLessComplete = false;
	@observable public validationError_targetIsNewer = false;

	public constructor(
		values: GlobalValues,
		albumRepo: AlbumRepository,
		id: number,
	) {
		makeObservable(this);

		this.target = new BasicEntryLinkStore<AlbumContract>(undefined, (entryId) =>
			albumRepo.getOne({ id: entryId, lang: values.languagePreference }),
		);

		this.targetSearchParams = {
			acceptSelection: (id): void => {
				runInAction(() => {
					this.target.id = id;
				});
			},
			ignoreId: id,
		};

		albumRepo
			.getOne({ id: id, lang: values.languagePreference })
			.then((base) => {
				const result = EntryMergeValidationHelper.validateEntry(
					base,
					this.target.entry,
				);
				runInAction(() => {
					this.validationError_targetIsLessComplete =
						result.validationError_targetIsLessComplete;
					this.validationError_targetIsNewer =
						result.validationError_targetIsNewer;
				});
			});
	}
}
