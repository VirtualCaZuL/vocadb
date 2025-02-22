import Breadcrumb from '@Bootstrap/Breadcrumb';
import ArtistApiContract from '@DataContracts/Artist/ArtistApiContract';
import EntryWithArchivedVersionsContract from '@DataContracts/Versioning/EntryWithArchivedVersionsForApiContract';
import EntryStatus from '@Models/EntryStatus';
import EntryType from '@Models/EntryType';
import ArtistRepository from '@Repositories/ArtistRepository';
import EntryUrlMapper from '@Shared/EntryUrlMapper';
import HttpClient from '@Shared/HttpClient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import Layout from '../Shared/Layout';
import ArchivedObjectVersions from '../Shared/Partials/ArchivedEntry/ArchivedObjectVersions';
import CurrentVersionMessage from '../Shared/Partials/ArchivedEntry/CurrentVersionMessage';
import useVocaDbTitle from '../useVocaDbTitle';

const httpClient = new HttpClient();
const artistRepo = new ArtistRepository(httpClient, vdb.values.baseAddress);

interface ArtistVersionsLayoutProps {
	model: EntryWithArchivedVersionsContract<ArtistApiContract>;
}

const ArtistVersionsLayout = ({
	model,
}: ArtistVersionsLayoutProps): React.ReactElement => {
	const { t, ready } = useTranslation(['ViewRes']);

	const title = `${t('ViewRes:EntryDetails.Revisions')} - ${model.entry.name}`;

	useVocaDbTitle(title, ready);

	return (
		<Layout
			title={title}
			parents={
				<>
					<Breadcrumb.Item
						linkAs={Link}
						linkProps={{
							to: '/Artist',
						}}
						divider
					>
						{t(`ViewRes:Shared.Artists`)}
					</Breadcrumb.Item>
					<Breadcrumb.Item
						linkAs={Link}
						linkProps={{
							to: EntryUrlMapper.details(EntryType.Artist, model.entry.id),
						}}
					>
						{model.entry.name}
					</Breadcrumb.Item>
				</>
			}
		>
			<CurrentVersionMessage
				version={model.entry.version}
				status={EntryStatus[model.entry.status as keyof typeof EntryStatus]}
			/>

			<ArchivedObjectVersions
				archivedVersions={model.archivedVersions}
				linkFunc={(id): string => `/Artist/ViewVersion/${id}`}
				entryType={EntryType.Artist}
			/>
		</Layout>
	);
};

const ArtistVersions = (): React.ReactElement => {
	const { id } = useParams();

	const [model, setModel] = React.useState<
		EntryWithArchivedVersionsContract<ArtistApiContract>
	>();

	React.useEffect(() => {
		artistRepo
			.getArtistWithArchivedVersions({ id: Number(id) })
			.then((model) => setModel(model));
	}, [id]);

	return model ? <ArtistVersionsLayout model={model} /> : <></>;
};

export default ArtistVersions;
