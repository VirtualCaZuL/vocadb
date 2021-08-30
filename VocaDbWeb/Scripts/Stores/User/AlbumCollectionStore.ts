import { ArtistAutoCompleteParams } from '@Components/KnockoutExtensions/AutoCompleteParams';
import PartialFindResultContract from '@DataContracts/PartialFindResultContract';
import ReleaseEventContract from '@DataContracts/ReleaseEvents/ReleaseEventContract';
import TagBaseContract from '@DataContracts/Tag/TagBaseContract';
import AlbumForUserForApiContract from '@DataContracts/User/AlbumForUserForApiContract';
import EntryType from '@Models/EntryType';
import ArtistRepository from '@Repositories/ArtistRepository';
import UserRepository from '@Repositories/UserRepository';
import EntryUrlMapper from '@Shared/EntryUrlMapper';
import GlobalValues from '@Shared/GlobalValues';
import BasicEntryLinkStore from '@Stores/BasicEntryLinkStore';
import AdvancedSearchFilters from '@Stores/Search/AdvancedSearchFilters';
import { AlbumSortRule } from '@Stores/Search/AlbumSearchStore';
import ServerSidePagingStore from '@Stores/ServerSidePagingStore';
import _ from 'lodash';
import {
	action,
	computed,
	makeObservable,
	observable,
	reaction,
	runInAction,
} from 'mobx';

export default class AlbumCollectionStore {
	public readonly advancedFilters = new AdvancedSearchFilters();
	@observable public albumType = 'Unknown' /* TODO: enum */;
	@observable public artistId?: number;
	@observable public artistName = '';
	@observable public artistSearchParams: ArtistAutoCompleteParams;
	@observable public collectionStatus = '';
	public isInit = false;
	@observable public loading = true; // Currently loading for data
	@observable public page: AlbumForUserForApiContract[] = []; // Current page of items
	public readonly paging = new ServerSidePagingStore(20); // Paging store
	public pauseNotifications = false;
	public readonly releaseEvent = new BasicEntryLinkStore<ReleaseEventContract>();
	@observable public searchTerm = '';
	@observable public sort = AlbumSortRule.Name;
	@observable public tag?: TagBaseContract;
	@observable public viewMode = 'Details'; /* TODO: enum */

	public constructor(
		private readonly values: GlobalValues,
		private readonly userRepo: UserRepository,
		private readonly artistRepo: ArtistRepository,
		private readonly userId: number,
		public readonly publicCollection: boolean,
		initialize = true,
	) {
		makeObservable(this);

		this.artistSearchParams = {
			acceptSelection: this.selectArtist,
		};

		reaction(
			() => this.advancedFilters.filters,
			this.updateResultsWithTotalCount,
		);
		reaction(() => this.albumType, this.updateResultsWithTotalCount);
		reaction(() => this.artistId, this.updateResultsWithTotalCount);
		reaction(() => this.collectionStatus, this.updateResultsWithTotalCount);
		reaction(() => this.paging.page, this.updateResultsWithoutTotalCount);
		reaction(() => this.paging.pageSize, this.updateResultsWithTotalCount);
		reaction(() => this.releaseEvent.id, this.updateResultsWithTotalCount);
		reaction(() => this.searchTerm, this.updateResultsWithTotalCount);
		reaction(() => this.sort, this.updateResultsWithoutTotalCount);
		reaction(() => this.tag, this.updateResultsWithTotalCount);

		if (initialize) this.init();
	}

	@computed public get tagId(): number | undefined {
		return this.tag?.id;
	}

	@computed public get tagName(): string | undefined {
		return this.tag?.name;
	}

	@computed public get tagUrl(): string | undefined {
		return EntryUrlMapper.details_tag_contract(this.tag);
	}

	@computed public releaseEventUrl(): string {
		return EntryUrlMapper.details(EntryType.ReleaseEvent, this.releaseEvent.id);
	}

	public init = (): void => {
		if (this.isInit) return;

		this.updateResultsWithTotalCount();
		this.isInit = true;
	};

	public ratingStars = (userRating: number): { enabled: boolean }[] => {
		const ratings = _.map([1, 2, 3, 4, 5], (rating) => {
			return { enabled: Math.round(userRating) >= rating };
		});
		return ratings;
	};

	public selectArtist = (selectedArtistId?: number): void => {
		this.artistId = selectedArtistId;
		this.artistRepo
			.getOne({
				id: selectedArtistId!,
				lang: this.values.languagePreference,
			})
			.then((artist) =>
				runInAction(() => {
					this.artistName = artist.name;
				}),
			);
	};

	@action public updateResults = (clearResults: boolean = true): void => {
		// Disable duplicate updates
		if (this.pauseNotifications) return;

		this.pauseNotifications = true;
		this.loading = true;

		if (clearResults) this.paging.goToFirstPage();

		const pagingProperties = this.paging.getPagingProperties(clearResults);

		this.userRepo
			.getAlbumCollectionList({
				userId: this.userId,
				paging: pagingProperties,
				lang: this.values.languagePreference,
				query: this.searchTerm,
				tag: this.tagId,
				albumType: this.albumType,
				artistId: this.artistId,
				purchaseStatuses: this.collectionStatus,
				releaseEventId: this.releaseEvent.id,
				advancedFilters: this.advancedFilters.filters,
				sort: this.sort,
			})
			.then((result: PartialFindResultContract<AlbumForUserForApiContract>) => {
				this.pauseNotifications = false;

				runInAction(() => {
					if (pagingProperties.getTotalCount)
						this.paging.totalItems = result.totalCount;

					this.page = result.items;
					this.loading = false;
				});
			});
	};

	public updateResultsWithTotalCount = (): void => this.updateResults(true);
	public updateResultsWithoutTotalCount = (): void => this.updateResults(false);
}
