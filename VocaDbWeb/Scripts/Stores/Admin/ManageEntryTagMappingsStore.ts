import EntryTypeAndSubTypeContract from '@DataContracts/EntryTypeAndSubTypeContract';
import EntryTagMappingContract from '@DataContracts/Tag/EntryTagMappingContract';
import TagBaseContract from '@DataContracts/Tag/TagBaseContract';
import AlbumType from '@Models/Albums/AlbumType';
import ArtistType from '@Models/Artists/ArtistType';
import EntryType from '@Models/EntryType';
import EventCategory from '@Models/Events/EventCategory';
import SongType from '@Models/Songs/SongType';
import TagRepository from '@Repositories/TagRepository';
import EntryUrlMapper from '@Shared/EntryUrlMapper';
import functions from '@Shared/GlobalFunctions';
import BasicEntryLinkStore from '@Stores/BasicEntryLinkStore';
import ServerSidePagingStore from '@Stores/ServerSidePagingStore';
import _ from 'lodash';
import { action, computed, makeObservable, observable } from 'mobx';

class EditEntryTagMappingStore {
	@observable public isDeleted = false;
	public readonly isNew: boolean;
	public readonly entryType: EntryTypeAndSubTypeContract;
	public readonly tag: TagBaseContract;

	public constructor(mapping: EntryTagMappingContract, isNew: boolean = false) {
		makeObservable(this);

		this.entryType = mapping.entryType;
		this.tag = mapping.tag;
		this.isNew = isNew;
	}

	@action public deleteMapping = (): void => {
		this.isDeleted = true;
	};
}

export default class ManageEntryTagMappingsStore {
	@observable public mappings: EditEntryTagMappingStore[] = [];
	public readonly paging = new ServerSidePagingStore(50);
	@observable public newEntryType = '';
	@observable public newEntrySubType = '';
	public readonly newTargetTag = new BasicEntryLinkStore<TagBaseContract>();

	public constructor(private readonly tagRepo: TagRepository) {
		makeObservable(this);

		this.loadMappings();
	}

	@computed public get activeMappings(): EditEntryTagMappingStore[] {
		return _.filter(this.mappings, (m) => !m.isDeleted);
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

	public entryTypes = this.getEnumValues<EntryType>(EntryType, [
		EntryType.Album,
		EntryType.Artist,
		EntryType.Song,
		EntryType.ReleaseEvent,
	]);

	private readonly entrySubTypesByType = [
		{ key: EntryType.Album, values: this.getEnumValues<AlbumType>(AlbumType) },
		{
			key: EntryType.Artist,
			values: this.getEnumValues<ArtistType>(ArtistType),
		},
		{ key: EntryType.Song, values: this.getEnumValues<SongType>(SongType) },
		{
			key: EntryType.ReleaseEvent,
			values: this.getEnumValues<EventCategory>(EventCategory),
		},
	];

	@computed public get entrySubTypes(): string[] {
		return (
			_.find(
				this.entrySubTypesByType,
				(et) => EntryType[et.key] === this.newEntryType,
			)?.values ?? []
		);
	}

	@action public addMapping = (): void => {
		if (!this.newEntryType || this.newTargetTag.isEmpty) return;

		if (
			_.some(
				this.mappings,
				(m) =>
					m.tag.id === this.newTargetTag.id &&
					m.entryType.entryType === this.newEntryType &&
					m.entryType.subType === this.newEntrySubType,
			)
		) {
			// TODO: showErrorMessage
			return;
		}

		this.mappings.push(
			new EditEntryTagMappingStore(
				{
					tag: this.newTargetTag.entry!,
					entryType: {
						entryType: this.newEntryType,
						subType: this.newEntrySubType,
					},
				},
				true,
			),
		);
		this.newEntrySubType = '';
		this.newEntryType = '';
		this.newTargetTag.clear();
	};

	@action public deleteMapping = (mapping: EditEntryTagMappingStore): void => {
		mapping.isDeleted = true;
	};

	public getTagUrl = (tag: EditEntryTagMappingStore): string => {
		return functions.mapAbsoluteUrl(
			EntryUrlMapper.details_tag(tag.tag.id, tag.tag.urlSlug),
		);
	};

	@action private loadMappings = async (): Promise<void> => {
		const result = await this.tagRepo.getEntryTagMappings({});
		this.mappings = _.map(result, (t) => new EditEntryTagMappingStore(t));
	};

	public save = async (): Promise<void> => {
		const mappings = this.activeMappings;
		await this.tagRepo.saveEntryMappings({ mappings: mappings });
		// TODO: showSuccessMessage
		await this.loadMappings();
	};
}
