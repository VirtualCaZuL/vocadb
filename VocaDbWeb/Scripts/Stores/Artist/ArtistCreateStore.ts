import DuplicateEntryResultContract from '@DataContracts/DuplicateEntryResultContract';
import TagApiContract from '@DataContracts/Tag/TagApiContract';
import ArtistType from '@Models/Artists/ArtistType';
import EntryType from '@Models/EntryType';
import ArtistRepository from '@Repositories/ArtistRepository';
import TagRepository from '@Repositories/TagRepository';
import EntryUrlMapper from '@Shared/EntryUrlMapper';
import GlobalValues from '@Shared/GlobalValues';
import WebLinkEditStore from '@Stores/WebLinkEditStore';
import {
	action,
	computed,
	makeObservable,
	observable,
	reaction,
	runInAction,
} from 'mobx';

export default class ArtistCreateStore {
	@observable public artistType =
		ArtistType[ArtistType.Producer] /* TODO: enum */;
	@observable public artistTypeTag?: TagApiContract;
	@observable public dupeEntries: DuplicateEntryResultContract[] = [];
	@observable public nameOriginal = '';
	@observable public nameRomaji = '';
	@observable public nameEnglish = '';
	@observable public submitting = false;
	public readonly webLink = new WebLinkEditStore();

	public constructor(
		private readonly values: GlobalValues,
		private readonly artistRepo: ArtistRepository,
		private readonly tagRepo: TagRepository,
	) {
		makeObservable(this);

		reaction(() => this.artistType, this.getArtistTypeTag);
		this.getArtistTypeTag(this.artistType);
	}

	@computed public get artistTypeName(): string | undefined {
		return this.artistTypeTag?.name;
	}

	@computed public get artistTypeInfo(): string | undefined {
		return this.artistTypeTag?.description;
	}

	@computed public get artistTypeTagUrl(): string | undefined {
		return EntryUrlMapper.details_tag_contract(this.artistTypeTag);
	}

	@action public checkDuplicates = (): void => {
		const term1 = this.nameOriginal;
		const term2 = this.nameRomaji;
		const term3 = this.nameEnglish;
		const linkUrl = this.webLink.url;

		this.artistRepo
			.findDuplicate({
				params: {
					term1: term1,
					term2: term2,
					term3: term3,
					linkUrl: linkUrl,
				},
			})
			.then((result) => {
				runInAction(() => {
					this.dupeEntries = result;
				});
			});
	};

	private getArtistTypeTag = async (artistType: string): Promise<void> => {
		const tag = await this.tagRepo.getEntryTypeTag({
			entryType: EntryType.Artist,
			subType: artistType,
			lang: this.values.languagePreference,
		});
		runInAction(() => {
			this.artistTypeTag = tag;
		});
	};

	@action public submit = (): boolean => {
		this.submitting = true;
		return true;
	};
}
