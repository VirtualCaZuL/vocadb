using System.Diagnostics.CodeAnalysis;
using System.Xml;
using System.Xml.Linq;
using VocaDb.Model.DataContracts.Albums;
using VocaDb.Model.Domain.Activityfeed;
using VocaDb.Model.Domain.Security;
using VocaDb.Model.Domain.Versioning;
using VocaDb.Model.Helpers;

namespace VocaDb.Model.Domain.Albums
{
	public class ArchivedAlbumVersion : ArchivedObjectVersion, IArchivedObjectVersionWithFields<AlbumEditableFields>
	{
		/// <summary>
		/// Creates an archived version of an album.
		/// </summary>
		/// <param name="album">Album to be archived. Cannot be null.</param>
		/// <param name="diff">Album diff. Cannot be null.</param>
		/// <param name="author">User creating the archived version. Cannot be null.</param>
		/// <param name="reason">Reason for archiving.</param>
		/// <param name="notes">Free-form edit notes. Cannot be null.</param>
		/// <returns>Archived album version. Cannot be null.</returns>
		/// <exception cref="XmlException">If the entry could not be serialized. This could happen if the object contains illegal characters.</exception>
		public static ArchivedAlbumVersion Create(Album album, AlbumDiff diff, AgentLoginData author, AlbumArchiveReason reason, string notes)
		{
			ParamIs.NotNull(() => album);
			ParamIs.NotNull(() => diff);
			ParamIs.NotNull(() => author);
			ParamIs.NotNull(() => notes);

			var contract = new ArchivedAlbumContract(album, diff);
			var data = XmlHelper.SerializeToXml(contract);

			return album.CreateArchivedVersion(data, diff, author, reason, notes);
		}

		private Album _album;
		private AlbumDiff _diff;

#nullable disable
		public ArchivedAlbumVersion()
		{
			Diff = new AlbumDiff();
			Reason = AlbumArchiveReason.Unknown;
		}
#nullable enable

		public ArchivedAlbumVersion(
			Album album,
			XDocument data,
			AlbumDiff diff,
			AgentLoginData author,
			int version,
			EntryStatus status,
			AlbumArchiveReason reason,
			string notes
		)
			: base(data, author, version, status, notes)
		{
			ParamIs.NotNull(() => data);
			ParamIs.NotNull(() => diff);

			Album = album;
			Diff = diff;
			Reason = reason;

			if (diff.IncludeCover)
			{
				CoverPicture = album.CoverPictureData;
				CoverPictureMime = album.CoverPictureMime;
			}
		}

		/// <summary>
		/// Album associated with this revision. Cannot be null.
		/// </summary>
		public virtual Album Album
		{
			get => _album;
			[MemberNotNull(nameof(_album))]
			protected set
			{
				ParamIs.NotNull(() => value);
				_album = value;
			}
		}

#nullable disable
		public virtual PictureData CoverPicture { get; set; }
#nullable enable

		public virtual string? CoverPictureMime { get; set; }

		public virtual AlbumDiff Diff
		{
			get => _diff;
			[MemberNotNull(nameof(_diff))]
			protected set => _diff = value;
		}

		public override IEntryDiff DiffBase => Diff;

		public override EntryEditEvent EditEvent
		{
			get
			{
				return Reason == AlbumArchiveReason.Created || Reason == AlbumArchiveReason.AutoImportedFromMikuDb
					? EntryEditEvent.Created
					: EntryEditEvent.Updated;
			}
		}

		public override IEntryWithNames EntryBase => Album;

		public virtual AlbumArchiveReason Reason { get; set; }

		public virtual ArchivedAlbumVersion? GetLatestVersionWithField(AlbumEditableFields field)
		{
			if (IsIncluded(field))
				return this;

			return Album.ArchivedVersionsManager.GetLatestVersionWithField(field, Version);
		}

		public virtual bool IsIncluded(AlbumEditableFields field)
		{
			return Diff != null && Data != null && Diff.IsIncluded(field);
		}
	}
}
