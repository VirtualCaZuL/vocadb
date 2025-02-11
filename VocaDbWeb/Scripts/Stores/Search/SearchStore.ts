import TagBaseContract from '@DataContracts/Tag/TagBaseContract';
import Tag from '@Models/Tags/Tag';
import AlbumRepository from '@Repositories/AlbumRepository';
import ArtistRepository from '@Repositories/ArtistRepository';
import EntryRepository from '@Repositories/EntryRepository';
import ReleaseEventRepository from '@Repositories/ReleaseEventRepository';
import SongRepository from '@Repositories/SongRepository';
import TagRepository from '@Repositories/TagRepository';
import UserRepository from '@Repositories/UserRepository';
import GlobalValues from '@Shared/GlobalValues';
import UrlMapper from '@Shared/UrlMapper';
import IStoreWithPaging from '@Stores/IStoreWithPaging';
import PVPlayersFactory from '@Stores/PVs/PVPlayersFactory';
import ServerSidePagingStore from '@Stores/ServerSidePagingStore';
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import {
	computed,
	makeObservable,
	observable,
	reaction,
	runInAction,
} from 'mobx';

import AlbumSearchStore, { AlbumSearchRouteParams } from './AlbumSearchStore';
import AnythingSearchStore, {
	AnythingSearchRouteParams,
} from './AnythingSearchStore';
import ArtistSearchStore, {
	ArtistSearchRouteParams,
} from './ArtistSearchStore';
import { ICommonSearchStore } from './CommonSearchStore';
import EventSearchStore, { EventSearchRouteParams } from './EventSearchStore';
import { ISearchCategoryBaseStore } from './SearchCategoryBaseStore';
import SongSearchStore, { SongSearchRouteParams } from './SongSearchStore';
import TagFilters from './TagFilters';
import TagSearchStore, { TagSearchRouteParams } from './TagSearchStore';

export enum SearchType {
	Anything = 'Anything',
	Artist = 'Artist',
	Album = 'Album',
	ReleaseEvent = 'ReleaseEvent',
	Song = 'Song',
	Tag = 'Tag',
}

export type SearchRouteParams =
	| AnythingSearchRouteParams
	| AlbumSearchRouteParams
	| ArtistSearchRouteParams
	| EventSearchRouteParams
	| SongSearchRouteParams
	| TagSearchRouteParams;

// TODO: Use single Ajv instance. See https://ajv.js.org/guide/managing-schemas.html.
const ajv = new Ajv({ coerceTypes: true });
addFormats(ajv);

// TODO: Make sure that we compile schemas only once and re-use compiled validation functions. See https://ajv.js.org/guide/getting-started.html.
const schema: JSONSchemaType<SearchRouteParams> = require('./SearchRouteParams.schema');
const validate = ajv.compile(schema);

export default class SearchStore
	implements ICommonSearchStore, IStoreWithPaging<SearchRouteParams> {
	public readonly albumSearchStore: AlbumSearchStore;
	public readonly anythingSearchStore: AnythingSearchStore;
	public readonly artistSearchStore: ArtistSearchStore;
	public readonly eventSearchStore: EventSearchStore;
	public readonly songSearchStore: SongSearchStore;
	public readonly tagSearchStore: TagSearchStore;

	@observable public draftsOnly = false;
	@observable public genreTags: TagBaseContract[] = [];
	@observable public pageSize = 10;
	@observable public showAdvancedFilters = false;
	@observable public searchTerm = '';
	@observable public searchType = SearchType.Anything;
	public readonly tagFilters: TagFilters;
	@observable public showTags = false;

	public constructor(
		values: GlobalValues,
		urlMapper: UrlMapper,
		entryRepo: EntryRepository,
		artistRepo: ArtistRepository,
		albumRepo: AlbumRepository,
		songRepo: SongRepository,
		eventRepo: ReleaseEventRepository,
		tagRepo: TagRepository,
		userRepo: UserRepository,
		pvPlayersFactory: PVPlayersFactory,
	) {
		makeObservable(this);

		this.tagFilters = new TagFilters(values, tagRepo);

		this.anythingSearchStore = new AnythingSearchStore(this, values, entryRepo);
		this.artistSearchStore = new ArtistSearchStore(this, values, artistRepo);
		this.albumSearchStore = new AlbumSearchStore(
			this,
			values,
			albumRepo,
			artistRepo,
		);
		this.eventSearchStore = new EventSearchStore(
			this,
			values,
			eventRepo,
			artistRepo,
		);
		this.songSearchStore = new SongSearchStore(
			this,
			values,
			urlMapper,
			songRepo,
			userRepo,
			eventRepo,
			artistRepo,
			pvPlayersFactory,
		);
		this.tagSearchStore = new TagSearchStore(this, values, tagRepo);

		reaction(() => this.showTags, this.updateResultsWithTotalCount);

		tagRepo
			.getTopTags({
				lang: values.languagePreference,
				categoryName: Tag.commonCategory_Genres,
				entryType: undefined,
			})
			.then((result) =>
				runInAction(() => {
					this.genreTags = result;
				}),
			);
	}

	@computed public get showAnythingSearch(): boolean {
		return this.searchType === SearchType.Anything;
	}

	@computed public get showArtistSearch(): boolean {
		return this.searchType === SearchType.Artist;
	}

	@computed public get showAlbumSearch(): boolean {
		return this.searchType === SearchType.Album;
	}

	@computed public get showEventSearch(): boolean {
		return this.searchType === SearchType.ReleaseEvent;
	}

	@computed public get showSongSearch(): boolean {
		return this.searchType === SearchType.Song;
	}

	@computed public get showTagSearch(): boolean {
		return this.searchType === SearchType.Tag;
	}

	@computed public get showTagFilter(): boolean {
		return !this.showTagSearch;
	}

	@computed public get showDraftsFilter(): boolean {
		return this.searchType !== SearchType.Tag;
	}

	@computed public get isUniversalSearch(): boolean {
		return this.searchType === SearchType.Anything;
	}

	private getCategoryStore = (
		searchType: SearchType,
	): ISearchCategoryBaseStore => {
		switch (searchType) {
			case SearchType.Anything:
				return this.anythingSearchStore;
			case SearchType.Artist:
				return this.artistSearchStore;
			case SearchType.Album:
				return this.albumSearchStore;
			case SearchType.ReleaseEvent:
				return this.eventSearchStore;
			case SearchType.Song:
				return this.songSearchStore;
			case SearchType.Tag:
				return this.tagSearchStore;
			default:
				throw new Error(`Invalid searchType: ${searchType}`);
		}
	};

	public get currentCategoryStore(): ISearchCategoryBaseStore {
		return this.getCategoryStore(this.searchType);
	}

	public popState = false;

	public get paging(): ServerSidePagingStore {
		return this.currentCategoryStore.paging;
	}

	public get clearResultsByQueryKeys(): string[] {
		return this.currentCategoryStore.clearResultsByQueryKeys;
	}

	@computed public get routeParams(): SearchRouteParams {
		return this.currentCategoryStore.routeParams;
	}
	public set routeParams(value: SearchRouteParams) {
		value.searchType ??= SearchType.Anything;
		this.searchType = value.searchType;
		this.currentCategoryStore.routeParams = value;
	}

	public validateRouteParams = (data: any): data is SearchRouteParams =>
		validate(data);

	public updateResults = (clearResults: boolean): void =>
		this.currentCategoryStore.updateResults(clearResults);

	public updateResultsWithTotalCount = (): void =>
		this.currentCategoryStore.updateResultsWithTotalCount();
}
