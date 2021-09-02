import { ArtistAutoCompleteParams } from '@Components/KnockoutExtensions/AutoCompleteParams';
import ArtistContract from '@DataContracts/Artist/ArtistContract';
import EntryMergeValidationHelper from '@Helpers/EntryMergeValidationHelper';
import ArtistRepository from '@Repositories/ArtistRepository';
import GlobalValues from '@Shared/GlobalValues';
import BasicEntryLinkStore from '@Stores/BasicEntryLinkStore';
import { makeObservable, observable, runInAction } from 'mobx';

export default class ArtistMergeStore {
	public readonly target: BasicEntryLinkStore<ArtistContract>;
	public readonly targetSearchParams: ArtistAutoCompleteParams;

	@observable public validationError_targetIsLessComplete = false;
	@observable public validationError_targetIsNewer = false;

	public constructor(
		values: GlobalValues,
		artistRepo: ArtistRepository,
		id: number,
	) {
		makeObservable(this);

		this.target = new BasicEntryLinkStore<ArtistContract>(
			undefined,
			(entryId) =>
				artistRepo.getOne({ id: entryId, lang: values.languagePreference }),
		);

		this.targetSearchParams = {
			acceptSelection: (id): void => {
				this.target.id = id;
			},
			ignoreId: id,
		};

		artistRepo
			.getOne({ id: id, lang: values.languagePreference })
			.then((base) => {
				const result = EntryMergeValidationHelper.validateEntry(
					base,
					this.target.entry!,
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
