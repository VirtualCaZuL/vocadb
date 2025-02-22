using VocaDb.Model.DataContracts;
using VocaDb.Model.Domain;
using VocaDb.Model.Helpers;

namespace VocaDb.Model.Database.Repositories
{
	public static class DatabaseContextHelper
	{
		public static void RestoreObjectRefs<TExisting, TEntry>(
			IDatabaseContext<TEntry> session,
			IList<string> warnings,
			IEnumerable<TExisting> existing,
			IEnumerable<ObjectRefContract> objRefs,
			Func<TExisting, ObjectRefContract, bool> equality,
			Func<TEntry?, TExisting?> createEntryFunc,
			Action<TExisting> deleteFunc
		)
			where TEntry : class, IDatabaseObject
			where TExisting : class, IDatabaseObject
		{
			RestoreObjectRefs(
				session,
				warnings,
				existing,
				objRefs,
				equality,
				createEntryFunc: (entry, ex) => createEntryFunc(entry),
				deleteFunc
			);
		}

		public static CollectionDiff<TExisting, TObjRef> RestoreObjectRefs<TExisting, TEntry, TObjRef>(
			IDatabaseContext<TEntry> session,
			IList<string> warnings,
			IEnumerable<TExisting> existing,
			IEnumerable<TObjRef>? objRefs,
			Func<TExisting, TObjRef, bool> equality,
			Func<TEntry?, TObjRef, TExisting?> createEntryFunc,
			Action<TExisting> deleteFunc
		)
			where TObjRef : ObjectRefContract
			where TEntry : class, IDatabaseObject
			where TExisting : class, IDatabaseObject
		{
			if (objRefs == null)
				objRefs = Enumerable.Empty<TObjRef>();

			var diff = CollectionHelper.Diff(existing, objRefs, equality);

			// If the reference existed in the version being restored, but doesn't exist in the current version.
			foreach (var objRef in diff.Added)
			{
				// If the reference points to an associated root entity in the database, attempt to restore the reference.
				if (objRef.Id != 0)
				{
					var entry = session.Get(objRef.Id);

					// Root entity still found in the database, create the link object.
					if (entry != null)
					{
						var added = createEntryFunc(entry, objRef);
						if (added != null)
							session.Save(added);
					}
					else
					{
						warnings.Add("Referenced " + typeof(TEntry).Name + " " + objRef + " not found");
					}
				}
				else
				{
					// For composite child objects just recreate the object since it's not a root entity.
					var added = createEntryFunc(null, objRef);
					if (added != null)
						session.Save(added);
				}
			}

			// If the reference did not exist in the version being restored, but exists in the current version, delete the link object.
			foreach (var removed in diff.Removed)
			{
				deleteFunc(removed);
				session.Delete(removed);
			}

			return diff;
		}

		/// <summary>
		/// Restores a weak root entity reference where the target might be deleted already.
		/// In this case a warning will be issued but otherwise the reference can be ignored.
		/// </summary>
		/// <typeparam name="TEntry">Type of entry to be loaded.</typeparam>
		/// <param name="session">Session.</param>
		/// <param name="warnings">List of warnings. Cannot be null.</param>
		/// <param name="objRef">Reference to the target. Can be null in which case null is returned.</param>
		/// <returns>The restored object reference. Can be null if the reference was null originally, or the target is deleted.</returns>
		public static TEntry? RestoreWeakRootEntityRef<TEntry>(IDatabaseContext<TEntry> session, IList<string> warnings, ObjectRefContract? objRef) where TEntry : class
		{
			if (objRef == null)
				return null;

			var obj = session.Get(objRef.Id);
			if (obj == null)
			{
				warnings.Add($"Referenced {typeof(TEntry).Name} {objRef} not found");
			}

			return obj;
		}
	}
}
