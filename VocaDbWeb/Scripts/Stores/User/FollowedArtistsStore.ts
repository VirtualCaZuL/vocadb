import PartialFindResultContract from '@DataContracts/PartialFindResultContract';
import ArtistForUserForApiContract from '@DataContracts/User/ArtistForUserForApiContract';
import TagRepository from '@Repositories/TagRepository';
import UserRepository from '@Repositories/UserRepository';
import GlobalValues from '@Shared/GlobalValues';
import TagFilters from '@Stores/Search/TagFilters';
import ServerSidePagingStore from '@Stores/ServerSidePagingStore';
import {
	action,
	makeObservable,
	observable,
	reaction,
	runInAction,
} from 'mobx';

export default class FollowedArtistsStore {
	@observable public artistType = 'Unknown'; /* TODO: enum */
	public isInit = false;
	@observable public loading = true; // Currently loading for data
	@observable public page: ArtistForUserForApiContract[] = []; // Current page of items
	public readonly paging = new ServerSidePagingStore(20); // Paging store
	public pauseNotifications = false;
	public readonly tagFilters: TagFilters;

	public constructor(
		private readonly values: GlobalValues,
		private readonly userRepo: UserRepository,
		tagRepo: TagRepository,
		private readonly userId: number,
	) {
		makeObservable(this);

		this.tagFilters = new TagFilters(values, tagRepo);

		reaction(() => this.paging.page, this.updateResultsWithoutTotalCount);
		reaction(() => this.paging.pageSize, this.updateResultsWithTotalCount);
		reaction(() => this.artistType, this.updateResultsWithTotalCount);
		reaction(() => this.tagFilters.tagIds, this.updateResultsWithTotalCount);
	}

	public init = (): void => {
		if (this.isInit) return;

		this.updateResultsWithTotalCount();
		this.isInit = true;
	};

	@action public updateResults = (clearResults: boolean = true): void => {
		// Disable duplicate updates
		if (this.pauseNotifications) return;

		this.pauseNotifications = true;
		this.loading = true;

		if (clearResults) this.paging.goToFirstPage();

		const pagingProperties = this.paging.getPagingProperties(clearResults);

		this.userRepo
			.getFollowedArtistsList({
				userId: this.userId,
				paging: pagingProperties,
				lang: this.values.languagePreference,
				tagIds: this.tagFilters.tagIds,
				artistType: this.artistType,
			})
			.then(
				(result: PartialFindResultContract<ArtistForUserForApiContract>) => {
					this.pauseNotifications = false;

					runInAction(() => {
						if (pagingProperties.getTotalCount)
							this.paging.totalItems = result.totalCount;

						this.page = result.items;
						this.loading = false;
					});
				},
			);
	};

	public updateResultsWithTotalCount = (): void => this.updateResults(true);
	public updateResultsWithoutTotalCount = (): void => this.updateResults(false);
}
