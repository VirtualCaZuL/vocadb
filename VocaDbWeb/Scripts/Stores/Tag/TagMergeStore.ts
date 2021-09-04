import TagApiContract from '@DataContracts/Tag/TagApiContract';
import TagBaseContract from '@DataContracts/Tag/TagBaseContract';
import EntryMergeValidationHelper from '@Helpers/EntryMergeValidationHelper';
import TagRepository from '@Repositories/TagRepository';
import BasicEntryLinkStore from '@Stores/BasicEntryLinkStore';
import { makeObservable, observable, runInAction } from 'mobx';

export default class TagMergeStore {
	public readonly target: BasicEntryLinkStore<TagBaseContract>;
	@observable public validationError_targetIsLessComplete = false;
	@observable public validationError_targetIsNewer = false;

	public constructor(
		tagRepo: TagRepository,
		private readonly base: TagBaseContract,
	) {
		makeObservable(this);

		this.target = new BasicEntryLinkStore<TagBaseContract>(undefined, (id) =>
			tagRepo.getById({ id: id, fields: undefined, lang: undefined }),
		);

		const result = EntryMergeValidationHelper.validateEntry(
			this.base,
			this.target.entry!,
		);
		runInAction(() => {
			this.validationError_targetIsLessComplete =
				result.validationError_targetIsLessComplete;
			this.validationError_targetIsNewer = result.validationError_targetIsNewer;
		});
	}

	public tagFilter = (tag: TagApiContract): boolean => {
		return tag.id !== this.base.id;
	};
}
