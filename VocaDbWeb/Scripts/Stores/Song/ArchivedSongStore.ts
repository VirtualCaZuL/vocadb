import SongRepository from '@Repositories/SongRepository';
import ReportEntryStore from '@Stores/ReportEntryStore';
import { makeObservable } from 'mobx';

export default class ArchivedSongStore {
	public readonly reportEntryStore: ReportEntryStore;

	public constructor(
		songId: number,
		versionNumber: number,
		songRepo: SongRepository,
	) {
		makeObservable(this);

		this.reportEntryStore = new ReportEntryStore(
			undefined,
			(reportType, notes) => {
				songRepo.createReport({
					songId: songId,
					reportType: reportType,
					notes: notes,
					versionNumber: versionNumber,
				});

				// TODO: showSuccessMessage
			},
			{ notesRequired: true, id: 'Other', name: undefined },
		);
	}
}
