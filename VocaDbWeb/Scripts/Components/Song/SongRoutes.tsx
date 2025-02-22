import ErrorNotFound from '@Components/Error/ErrorNotFound';
import EntryType from '@Models/EntryType';
import EntryUrlMapper from '@Shared/EntryUrlMapper';
import qs from 'qs';
import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { SearchType } from '../../Stores/Search/SearchStore';

const SongRankings = React.lazy(() => import('./SongRankings'));
const SongVersions = React.lazy(() => import('./SongVersions'));

const SongDetailsNavigate = (): React.ReactElement => {
	const { id } = useParams();

	return (
		<Navigate
			to={EntryUrlMapper.details(EntryType.Song, Number(id))}
			replace={true}
		/>
	);
};

const SongRoutes = (): React.ReactElement => {
	return (
		<Routes>
			<Route
				path=""
				element={
					<Navigate
						to={`/Search?${qs.stringify({ searchType: SearchType.Song })}`}
						replace={true}
					/>
				}
			/>
			<Route path="Details/:id" element={<SongDetailsNavigate />} />
			<Route path="Rankings" element={<SongRankings />} />
			<Route path="Versions/:id" element={<SongVersions />} />
			<Route path="*" element={<ErrorNotFound />} />
		</Routes>
	);
};

export default SongRoutes;
