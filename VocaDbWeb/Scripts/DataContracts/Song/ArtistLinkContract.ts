import ArtistApiContract from '../Artist/ArtistApiContract';

export default interface ArtistLinkContract {
	artist: ArtistApiContract;
	categories: string /* TODO: enum */;
	effectiveRoles: string /* TODO: enum */;
	isSupport: boolean;
	name: string;
}
