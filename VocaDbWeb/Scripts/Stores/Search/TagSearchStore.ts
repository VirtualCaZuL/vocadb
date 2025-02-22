import PagingProperties from '@DataContracts/PagingPropertiesContract';
import PartialFindResultContract from '@DataContracts/PartialFindResultContract';
import TagApiContract from '@DataContracts/Tag/TagApiContract';
import TagRepository from '@Repositories/TagRepository';
import GlobalValues from '@Shared/GlobalValues';
import { computed, makeObservable, observable } from 'mobx';

import { ICommonSearchStore } from './CommonSearchStore';
import SearchCategoryBaseStore from './SearchCategoryBaseStore';
import { SearchType } from './SearchStore';

// Corresponds to the TagSortRule enum in C#.
export enum TagSortRule {
	Nothing = 'Nothing',
	Name = 'Name',
	AdditionDate = 'AdditionDate',
	UsageCount = 'UsageCount',
}

export interface TagSearchRouteParams {
	categoryName?: string;
	filter?: string;
	page?: number;
	pageSize?: number;
	searchType?: SearchType.Tag;
	sort?: TagSortRule;
}

export default class TagSearchStore extends SearchCategoryBaseStore<TagApiContract> {
	@observable public allowAliases = false;
	@observable public categoryName?: string;
	@observable public sort = TagSortRule.Name;

	public constructor(
		commonSearchStore: ICommonSearchStore,
		private readonly values: GlobalValues,
		private readonly tagRepo: TagRepository,
	) {
		super(commonSearchStore);

		makeObservable(this);
	}

	public loadResults = (
		pagingProperties: PagingProperties,
		searchTerm: string,
		tags: number[],
		childTags: boolean,
		status?: string,
	): Promise<PartialFindResultContract<TagApiContract>> => {
		return this.tagRepo.getList({
			queryParams: {
				start: pagingProperties.start,
				maxResults: pagingProperties.maxEntries,
				getTotalCount: pagingProperties.getTotalCount,
				lang: this.values.languagePreference,
				query: searchTerm,
				sort: this.sort,
				allowAliases: this.allowAliases,
				categoryName: this.categoryName,
				fields: 'AdditionalNames,MainPicture',
			},
		});
	};

	public readonly clearResultsByQueryKeys: (keyof TagSearchRouteParams)[] = [
		'pageSize',
		'filter',
		'searchType',

		// TODO: allowAliases
		'categoryName',
		'sort',
	];

	@computed.struct public get routeParams(): TagSearchRouteParams {
		return {
			searchType: SearchType.Tag,
			categoryName: this.categoryName,
			filter: this.searchTerm,
			page: this.paging.page,
			pageSize: this.paging.pageSize,
			sort: this.sort,
		};
	}
	public set routeParams(value: TagSearchRouteParams) {
		this.categoryName = value.categoryName;
		this.searchTerm = value.filter ?? '';
		this.paging.page = value.page ?? 1;
		this.paging.pageSize = value.pageSize ?? 10;
		this.sort = value.sort ?? TagSortRule.Name;
	}
}
