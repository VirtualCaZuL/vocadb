import ArtistRepository from '@Repositories/ArtistRepository';
import ReportEntryStore from '@Stores/ReportEntryStore';
import { makeObservable } from 'mobx';

export default class ArchivedArtistStore {
	public readonly reportStore: ReportEntryStore;

	public constructor(
		artistId: number,
		versionNumber: number,
		private readonly artistRepo: ArtistRepository,
	) {
		makeObservable(this);

		this.reportStore = new ReportEntryStore(
			undefined,
			(reportType, notes) => {
				artistRepo.createReport({
					artistId: artistId,
					reportType: reportType,
					notes: notes,
					versionNumber: versionNumber,
				});

				// TODO: ui.showSuccessMessage
			},
			{ notesRequired: true, id: 'Other', name: undefined },
		);
	}
}
