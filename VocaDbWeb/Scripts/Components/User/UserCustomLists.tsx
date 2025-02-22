import SafeAnchor from '@Bootstrap/SafeAnchor';
import UserDetailsContract from '@DataContracts/User/UserDetailsContract';
import LoginManager from '@Models/LoginManager';
import UserDetailsStore, {
	UserSongListsStore,
} from '@Stores/User/UserDetailsStore';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';

import SongListsKnockout from '../Shared/Partials/Song/SongListsKnockout';
import SongListsFilters from '../Shared/Partials/SongListsFilters';
import useStoreWithUpdateResults from '../useStoreWithUpdateResults';
import { UserDetailsNav } from './UserDetailsRoutes';

const loginManager = new LoginManager(vdb.values);

interface SongListsProps {
	user: UserDetailsContract;
	songLists: UserSongListsStore;
}

const SongLists = observer(
	({ user, songLists }: SongListsProps): React.ReactElement => {
		const { t } = useTranslation(['ViewRes', 'ViewRes.User']);

		useStoreWithUpdateResults(songLists);

		const ownProfile =
			loginManager.loggedUser &&
			loginManager.loggedUser.id === user.id &&
			loginManager.loggedUser.active;

		return (
			<>
				<SongListsFilters songListsBaseStore={songLists} />

				<SongListsKnockout songListsBaseStore={songLists} groupByYear={true} />

				{songLists.hasMore && (
					<h3>
						<SafeAnchor href="#" onClick={songLists.loadMore}>
							{t('ViewRes:Shared.ShowMore')}
						</SafeAnchor>
					</h3>
				)}

				{ownProfile && (
					<>
						<a href="/SongList/Edit" className="textLink addLink">
							{t('ViewRes.User:Details.CreateNewList')}
						</a>{' '}
						<a href="/SongList/Import" className="textLink wandIcon">
							{t('ViewRes.User:Details.ImportSongList')}
						</a>
					</>
				)}
			</>
		);
	},
);

interface UserCustomListsProps {
	user: UserDetailsContract;
	userDetailsStore: UserDetailsStore;
}

const UserCustomLists = ({
	user,
	userDetailsStore,
}: UserCustomListsProps): React.ReactElement => {
	return (
		<>
			<UserDetailsNav user={user} tab="customLists" />

			<SongLists user={user} songLists={userDetailsStore.songLists} />
		</>
	);
};

export default UserCustomLists;
