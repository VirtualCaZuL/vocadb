import AlbumRepository from '@Repositories/AlbumRepository';
import ReportEntryStore from '@Stores/ReportEntryStore';

export default class ArchivedAlbumStore {
	public readonly reportStore: ReportEntryStore;

	public constructor(
		albumId: number,
		versionNumber: number,
		albumRepo: AlbumRepository,
	) {
		this.reportStore = new ReportEntryStore(
			undefined,
			(reportType, notes) => {
				albumRepo.createReport({
					albumId: albumId,
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
