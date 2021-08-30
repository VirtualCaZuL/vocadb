import PartialFindResultContract from '@DataContracts/PartialFindResultContract';
import SongApiContract from '@DataContracts/Song/SongApiContract';
import SongListBaseContract from '@DataContracts/SongListBaseContract';
import RatedSongForUserForApiContract from '@DataContracts/User/RatedSongForUserForApiContract';
import PVServiceIcons from '@Models/PVServiceIcons';
import ArtistRepository from '@Repositories/ArtistRepository';
import SongRepository from '@Repositories/SongRepository';
import TagRepository from '@Repositories/TagRepository';
import UserRepository from '@Repositories/UserRepository';
import GlobalValues from '@Shared/GlobalValues';
import UrlMapper from '@Shared/UrlMapper';
import AdvancedSearchFilters from '@Stores/Search/AdvancedSearchFilters';
import ArtistFilters from '@Stores/Search/ArtistFilters';
import { SongSortRule } from '@Stores/Search/SongSearchStore';
import TagFilters from '@Stores/Search/TagFilters';
import ServerSidePagingStore from '@Stores/ServerSidePagingStore';
import SongWithPreviewStore from '@Stores/Song/SongWithPreviewStore';
import { SongListSortRule } from '@Stores/SongList/SongListsBaseStore';
import _ from 'lodash';
import {
	action,
	computed,
	makeObservable,
	observable,
	reaction,
	runInAction,
} from 'mobx';
import moment from 'moment';

export interface IRatedSongSearchItem extends SongApiContract {
	previewStore?: SongWithPreviewStore;
	rating?: string;
}

export default class RatedSongsSearchStore {
	public readonly advancedFilters = new AdvancedSearchFilters();
	public artistFilters: ArtistFilters;
	@observable public groupByRating = true;
	public isInit = false;
	@observable public loading = true; // Currently loading for data
	@observable public page: IRatedSongSearchItem[] = []; // Current page of items
	public readonly paging = new ServerSidePagingStore(20); // Paging view model
	public pauseNotifications = false;
	// TODO: public playListStore: PlayListStore;
	// TODO: public pvPlayerStore: PVPlayerStore;
	public pvServiceIcons: PVServiceIcons;
	@observable public rating = 'Nothing' /* TODO: enum */;
	@observable public searchTerm = '';
	@observable public showTags = false;
	@observable public songListId?: number;
	@observable public songLists: SongListBaseContract[] = [];
	@observable public sort = SongSortRule.Name;
	public readonly tagFilters: TagFilters;
	@observable public viewMode = 'Details' /* TODO: enum */;

	public constructor(
		private readonly values: GlobalValues,
		urlMapper: UrlMapper,
		private readonly userRepo: UserRepository,
		artistRepo: ArtistRepository,
		private readonly songRepo: SongRepository,
		tagRepo: TagRepository,
		private readonly userId: number,
		//pvPlayersFactory: PVPlayersFactory,
		initialize = true,
	) {
		makeObservable(this);

		this.artistFilters = new ArtistFilters(values, artistRepo);

		this.pvServiceIcons = new PVServiceIcons(urlMapper);

		this.tagFilters = new TagFilters(values, tagRepo);

		reaction(
			() => this.advancedFilters.filters,
			this.updateResultsWithTotalCount,
		);
		reaction(
			() => this.artistFilters.filters,
			this.updateResultsWithTotalCount,
		);
		reaction(() => this.groupByRating, this.updateResultsWithoutTotalCount);
		reaction(() => this.paging.page, this.updateResultsWithoutTotalCount);
		reaction(() => this.paging.pageSize, this.updateResultsWithTotalCount);
		reaction(() => this.rating, this.updateResultsWithTotalCount);
		reaction(() => this.searchTerm, this.updateResultsWithTotalCount);
		reaction(() => this.showTags, this.updateResultsWithoutTotalCount);
		reaction(() => this.songListId, this.updateResultsWithTotalCount);
		reaction(() => this.sort, this.updateResultsWithoutTotalCount);
		reaction(() => this.tagFilters.tagIds, this.updateResultsWithTotalCount);
		reaction(() => this.viewMode, this.updateResultsWithTotalCount);

		// TODO: this.pvPlayerStore

		// TODO: this.playListStore

		if (initialize) this.init();
	}

	@computed public get fields(): string {
		return `AdditionalNames,ThumbUrl${this.showTags ? ',Tags' : ''}`;
	}

	public init = (): void => {
		if (this.isInit) return;

		this.userRepo
			.getSongLists({
				userId: this.userId,
				query: undefined,
				paging: { start: 0, maxEntries: 50, getTotalCount: false },
				tagIds: [],
				sort: SongListSortRule.Name,
				fields: undefined,
			})
			.then((songLists) =>
				runInAction(() => {
					this.songLists = songLists.items;
				}),
			);

		this.updateResultsWithTotalCount();
		this.isInit = true;
	};

	public formatDate = (dateStr: string): string => {
		return moment(dateStr).format('l');
	};

	public getPVServiceIcons = (
		services: string,
	): { service: string; url: string }[] => {
		return this.pvServiceIcons.getIconUrls(services);
	};

	@action public updateResults = (clearResults: boolean = true): void => {
		// Disable duplicate updates
		if (this.pauseNotifications) return;

		this.pauseNotifications = true;
		this.loading = true;

		if (clearResults) this.paging.goToFirstPage();

		const pagingProperties = this.paging.getPagingProperties(clearResults);

		if (this.viewMode === 'PlayList') {
			// TODO
			return;
		}

		this.userRepo
			.getRatedSongsList({
				userId: this.userId,
				paging: pagingProperties,
				lang: this.values.languagePreference,
				query: this.searchTerm,
				tagIds: this.tagFilters.tagIds,
				artistIds: this.artistFilters.artistIds,
				childVoicebanks: this.artistFilters.childVoicebanks,
				rating: this.rating,
				songListId: this.songListId,
				advancedFilters: this.advancedFilters.filters,
				groupByRating: this.groupByRating,
				pvServices: undefined,
				fields: this.fields,
				sort: this.sort,
			})
			.then(
				(result: PartialFindResultContract<RatedSongForUserForApiContract>) => {
					var songs: IRatedSongSearchItem[] = [];

					_.each(result.items, (item) => {
						const song: IRatedSongSearchItem = item.song!;

						song.rating = item.rating;

						if (song.pvServices && song.pvServices !== 'Nothing') {
							song.previewStore = new SongWithPreviewStore(
								this.songRepo,
								this.userRepo,
								song.id,
								song.pvServices,
							);
							// TODO: song.previewStore.ratingComplete =
						} else {
							song.previewStore = undefined;
						}
					});

					this.pauseNotifications = false;

					runInAction(() => {
						if (pagingProperties.getTotalCount)
							this.paging.totalItems = result.totalCount;

						this.page = songs;
						this.loading = false;
					});
				},
			);
	};

	public updateResultsWithTotalCount = (): void => this.updateResults(true);
	public updateResultsWithoutTotalCount = (): void => this.updateResults(false);
}
