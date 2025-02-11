import DiscTypesDropdownKnockout from '@Components/Shared/Partials/Album/DiscTypesDropdownKnockout';
import ArtistFilters from '@Components/Shared/Partials/Knockout/ArtistFilters';
import { AlbumAdvancedFilters } from '@Components/Shared/Partials/Search/AdvancedFilters';
import AlbumType from '@Models/Albums/AlbumType';
import AlbumSearchStore from '@Stores/Search/AlbumSearchStore';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AlbumSearchOptionsProps {
	albumSearchStore: AlbumSearchStore;
}

const AlbumSearchOptions = observer(
	({ albumSearchStore }: AlbumSearchOptionsProps): React.ReactElement => {
		const { t } = useTranslation([
			'ViewRes.Search',
			'VocaDb.Web.Resources.Domain',
		]);

		return (
			<div>
				<div className="control-group">
					<div className="control-label">
						{t('ViewRes.Search:Index.AlbumType')}
					</div>
					<div className="controls">
						<DiscTypesDropdownKnockout
							activeKey={albumSearchStore.albumType}
							onSelect={(eventKey): void =>
								runInAction(() => {
									albumSearchStore.albumType = eventKey as AlbumType;
								})
							}
						/>
					</div>
				</div>

				<div className="control-group">
					<div className="control-label">
						{t('VocaDb.Web.Resources.Domain:EntryTypeNames:Artist')}
					</div>
					<div className="controls">
						<ArtistFilters
							artistFilters={albumSearchStore.artistFilters}
							artistParticipationStatus={true}
						/>
					</div>
				</div>

				<div className="control-group">
					<div className="control-label"></div>
					<div className="controls">
						<AlbumAdvancedFilters
							advancedFilters={albumSearchStore.advancedFilters}
						/>
					</div>
				</div>
			</div>
		);
	},
);

export default AlbumSearchOptions;
