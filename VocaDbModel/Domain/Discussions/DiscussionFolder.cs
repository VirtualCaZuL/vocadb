﻿using System.Collections.Generic;
using VocaDb.Model.Domain.Users;

namespace VocaDb.Model.Domain.Discussions {

	public class DiscussionFolder {

		private string description;
		private string title;
		private IList<DiscussionTopic> topics = new List<DiscussionTopic>();

		public DiscussionFolder() {
			Description = string.Empty;
		}

		public virtual bool Deleted { get; set; }

		public virtual string Description {
			get { return description; }
			set {
				ParamIs.NotNull(() => value);
				description = value;
			}
		}

		public virtual int Id { get; set; }

		public virtual string Name {
			get { return title; }
			set {
				ParamIs.NotNull(() => value);
				title = value;
			}
		}

		public virtual UserGroupId RequiredGroup { get; set; }

		public virtual int SortIndex { get; set; }

		public virtual IList<DiscussionTopic> Topics {
			get { return topics; }
			set {
				ParamIs.NotNull(() => value);
				topics = value;
			}
		}

		public override string ToString() {
			return string.Format("Discussion folder '{0}' [{1}]", Name, Id);
		}

	}

}
