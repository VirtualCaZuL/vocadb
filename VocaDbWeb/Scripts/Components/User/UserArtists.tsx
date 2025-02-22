import UserDetailsContract from '@DataContracts/User/UserDetailsContract';
import ArtistType from '@Models/Artists/ArtistType';
import EntryStatus from '@Models/EntryStatus';
import EntryType from '@Models/EntryType';
import EntryUrlMapper from '@Shared/EntryUrlMapper';
import FollowedArtistsStore from '@Stores/User/FollowedArtistsStore';
import UserDetailsStore from '@Stores/User/UserDetailsStore';
import classNames from 'classnames';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import TagAutoComplete from '../KnockoutExtensions/TagAutoComplete';
import ArtistTypeLabel from '../Shared/Partials/Artist/ArtistTypeLabel';
import ArtistTypesDropdownKnockout from '../Shared/Partials/Artist/ArtistTypesDropdownKnockout';
import EntryCountBox from '../Shared/Partials/EntryCountBox';
import ServerSidePaging from '../Shared/Partials/Knockout/ServerSidePaging';
import DraftIcon from '../Shared/Partials/Shared/DraftIcon';
import TagFilters from '../Shared/Partials/TagFilters';
import useStoreWithPaging from '../useStoreWithPaging';
import { UserDetailsNav } from './UserDetailsRoutes';

interface FollowedArtistsProps {
	followedArtistsStore: FollowedArtistsStore;
}

const FollowedArtists = observer(
	({ followedArtistsStore }: FollowedArtistsProps): React.ReactElement => {
		const { t } = useTranslation([
			'ViewRes',
			'ViewRes.Search',
			'VocaDb.Model.Resources',
		]);

		useStoreWithPaging(followedArtistsStore);

		return (
			<>
				<div className="form-horizontal well well-transparent">
					<div className="control-group">
						<div className="control-label">
							{t('ViewRes.Search:Index.ArtistType')}
						</div>
						<div className="controls">
							<ArtistTypesDropdownKnockout
								value={followedArtistsStore.artistType}
								onChange={(e): void =>
									runInAction(() => {
										followedArtistsStore.artistType = e.target
											.value as ArtistType;
									})
								}
							/>
						</div>
					</div>

					<div className="control-group">
						<div className="control-label">{t('ViewRes:Shared.Tag')}</div>
						<div className="controls">
							<TagFilters tagFilters={followedArtistsStore.tagFilters} />
							<div>
								<TagAutoComplete
									type="text"
									className="input-large"
									onAcceptSelection={followedArtistsStore.tagFilters.addTag}
									placeholder={t('ViewRes:Shared.Search')}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className={classNames(followedArtistsStore.loading && 'loading')}>
					<EntryCountBox pagingStore={followedArtistsStore.paging} />

					<ServerSidePaging pagingStore={followedArtistsStore.paging} />

					<table
						className={classNames(
							'table',
							'table-striped',
							followedArtistsStore.loading && 'loading',
						)}
					>
						<thead>
							<tr>
								<th colSpan={2}>{t('ViewRes:Shared.ArtistName')}</th>
							</tr>
						</thead>
						<tbody>
							{followedArtistsStore.page.map((artistForUser) => (
								<tr key={artistForUser.artist.id}>
									<td style={{ width: '80px' }}>
										{artistForUser.artist.mainPicture &&
											artistForUser.artist.mainPicture.urlTinyThumb && (
												<Link
													to={EntryUrlMapper.details(
														EntryType.Artist,
														artistForUser.artist.id,
													)}
													title={artistForUser.artist.additionalNames}
													className="coverPicThumb"
												>
													{/* eslint-disable-next-line jsx-a11y/alt-text */}
													<img
														src={artistForUser.artist.mainPicture.urlTinyThumb}
														title="Cover picture" /* TODO: localize */
														className="coverPicThumb img-rounded"
													/>
												</Link>
											)}
									</td>
									<td>
										<Link
											to={EntryUrlMapper.details(
												EntryType.Artist,
												artistForUser.artist.id,
											)}
										>
											{artistForUser.artist.name}
										</Link>{' '}
										<ArtistTypeLabel
											artistType={artistForUser.artist.artistType}
										/>{' '}
										<DraftIcon
											status={
												EntryStatus[
													artistForUser.artist
														.status as keyof typeof EntryStatus
												]
											}
										/>
										<br />
										{artistForUser.artist.additionalNames && (
											<span>
												<small className="extraInfo">
													{artistForUser.artist.additionalNames}
												</small>
												<br />
											</span>
										)}
										<small className="extraInfo">
											{t(
												`VocaDb.Model.Resources:ArtistTypeNames:${artistForUser.artist.artistType}`,
											)}
										</small>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<ServerSidePaging pagingStore={followedArtistsStore.paging} />
				</div>
			</>
		);
	},
);

interface UserArtistsProps {
	user: UserDetailsContract;
	userDetailsStore: UserDetailsStore;
}

const UserArtists = ({
	user,
	userDetailsStore,
}: UserArtistsProps): React.ReactElement => {
	return (
		<>
			<UserDetailsNav user={user} tab="artists" />

			<FollowedArtists
				followedArtistsStore={userDetailsStore.followedArtistsStore}
			/>
		</>
	);
};

export default UserArtists;
