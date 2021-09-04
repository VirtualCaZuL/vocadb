import { SongAutoCompleteParams } from '@Components/KnockoutExtensions/AutoCompleteParams';
import SongContract from '@DataContracts/Song/SongContract';
import EntryMergeValidationHelper from '@Helpers/EntryMergeValidationHelper';
import SongRepository from '@Repositories/SongRepository';
import GlobalValues from '@Shared/GlobalValues';
import BasicEntryLinkStore from '@Stores/BasicEntryLinkStore';
import { makeObservable, observable } from 'mobx';

export default class SongMergeStore {
	public readonly target: BasicEntryLinkStore<SongContract>;
	public readonly targetSearchParams: SongAutoCompleteParams;

	@observable public validationError_targetIsLessComplete = false;
	@observable public validationError_targetIsNewer = false;

	public constructor(
		values: GlobalValues,
		songRepo: SongRepository,
		private readonly base: SongContract,
	) {
		makeObservable(this);

		this.target = new BasicEntryLinkStore<SongContract>(undefined, (entryId) =>
			songRepo.getOne({ id: entryId, lang: values.languagePreference }),
		);

		this.targetSearchParams = {
			acceptSelection: (id): void => {
				this.target.id = id;
			},
			ignoreId: base.id,
		};

		const result = EntryMergeValidationHelper.validateEntry(
			this.base,
			this.target.entry,
		);
		this.validationError_targetIsLessComplete =
			result.validationError_targetIsLessComplete;
		this.validationError_targetIsNewer = result.validationError_targetIsNewer;
	}
}
