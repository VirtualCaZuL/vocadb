import AlbumType from '@Models/Albums/AlbumType';
import ArtistType from '@Models/Artists/ArtistType';
import SongType from '@Models/Songs/SongType';
import RepositoryFactory from '@Repositories/RepositoryFactory';
import functions from '@Shared/GlobalFunctions';
import HttpClient from '@Shared/HttpClient';
import UrlMapper from '@Shared/UrlMapper';
import PVPlayersFactory from '@ViewModels/PVs/PVPlayersFactory';
import SearchViewModel from '@ViewModels/Search/SearchViewModel';
import $ from 'jquery';
import ko from 'knockout';
import moment from 'moment';

const SearchIndex = (model: {
	artistId: number[];
	artistType: ArtistType;
	autoplay: boolean;
	childTags: boolean;
	childVoicebanks: boolean;
	discType: AlbumType;
	eventCategory: string;
	eventId: number;
	filter: string;
	minScore: number;
	onlyRatedSongs: boolean;
	onlyWithPVs: boolean;
	pageSize: number;
	searchTypeName: string;
	shuffle: boolean;
	since: number;
	songType: SongType;
	sort: string;
	tagId: number[];
	viewMode: string;
}): void => {
	$(function () {
		moment.locale(vdb.values.culture);
		var query = model.filter;
		var tagIds = model.tagId;
		var searchType = model.searchTypeName;
		var sort = model.sort;
		var artistId = model.artistId;
		var childTags = model.childTags;
		var childVoicebanks = model.childVoicebanks;
		var eventId = model.eventId;
		var artistType = model.artistType;
		var discType = model.discType;
		var songType = model.songType;
		var eventCategory = model.eventCategory;
		var onlyWithPVs = model.onlyWithPVs;
		var onlyRatedSongs = model.onlyRatedSongs;
		var since = model.since;
		var minScore = model.minScore;
		var viewMode = model.viewMode;
		var autoplay = model.autoplay;
		var shuffle = model.shuffle;
		var pageSize = model.pageSize;
		var unknownPictureUrl = functions.mapAbsoluteUrl('/Content/unknown.png');

		const httpClient = new HttpClient();
		var rootPath = vdb.values.baseAddress;
		var urlMapper = new UrlMapper(rootPath);
		var repoFactory = new RepositoryFactory(httpClient, urlMapper);
		var resourceRepo = repoFactory.resourceRepository();
		var entryRepo = repoFactory.entryRepository();
		var artistRepo = repoFactory.artistRepository();
		var albumRepo = repoFactory.albumRepository();
		var songRepo = repoFactory.songRepository();
		var eventRepo = repoFactory.eventRepository();
		var tagRepo = repoFactory.tagRepository();
		var userRepo = repoFactory.userRepository();
		var pvPlayerElem = $('#pv-player-wrapper')[0];
		var pvPlayersFactory = new PVPlayersFactory(pvPlayerElem);

		var vm = new SearchViewModel(
			vdb.values,
			urlMapper,
			entryRepo,
			artistRepo,
			albumRepo,
			songRepo,
			eventRepo,
			tagRepo,
			resourceRepo,
			userRepo,
			unknownPictureUrl,
			searchType,
			query,
			tagIds,
			sort,
			artistId,
			childTags,
			childVoicebanks,
			eventId,
			artistType,
			discType,
			songType,
			eventCategory,
			onlyWithPVs,
			onlyRatedSongs,
			since,
			minScore,
			viewMode,
			autoplay,
			shuffle,
			pageSize,
			pvPlayersFactory,
		);
		ko.applyBindings(vm);
	});
};

export default SearchIndex;
