#nullable disable

using System.Runtime.Serialization;
using VocaDb.Model.DataContracts.Artists;
using VocaDb.Model.Domain.Globalization;
using VocaDb.Model.Domain.Images;
using VocaDb.Model.Domain.Users;

namespace VocaDb.Model.DataContracts.Users
{
	[DataContract]
	public class ArtistForUserForApiContract
	{
		public ArtistForUserForApiContract()
		{
		}

		public ArtistForUserForApiContract(ArtistForUser artistForUser,
			ContentLanguagePreference languagePreference,
			IAggregatedEntryImageUrlFactory thumbPersister,
			ArtistOptionalFields includedFields)
		{
			Artist = artistForUser != null ? new ArtistForApiContract(artistForUser.Artist, languagePreference, thumbPersister, includedFields) : null;
		}

		[DataMember]
		public ArtistForApiContract Artist { get; init; }
	}
}
