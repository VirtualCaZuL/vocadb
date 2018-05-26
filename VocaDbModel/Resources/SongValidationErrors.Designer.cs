﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace VocaDb.Model.Resources {
    using System;
    
    
    /// <summary>
    ///   A strongly-typed resource class, for looking up localized strings, etc.
    /// </summary>
    // This class was auto-generated by the StronglyTypedResourceBuilder
    // class via a tool like ResGen or Visual Studio.
    // To add or remove a member, edit your .ResX file then rerun ResGen
    // with the /str option, or rebuild your VS project.
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("System.Resources.Tools.StronglyTypedResourceBuilder", "15.0.0.0")]
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
    [global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    public class SongValidationErrors {
        
        private static global::System.Resources.ResourceManager resourceMan;
        
        private static global::System.Globalization.CultureInfo resourceCulture;
        
        [global::System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1811:AvoidUncalledPrivateCode")]
        internal SongValidationErrors() {
        }
        
        /// <summary>
        ///   Returns the cached ResourceManager instance used by this class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        public static global::System.Resources.ResourceManager ResourceManager {
            get {
                if (object.ReferenceEquals(resourceMan, null)) {
                    global::System.Resources.ResourceManager temp = new global::System.Resources.ResourceManager("VocaDb.Model.Resources.SongValidationErrors", typeof(SongValidationErrors).Assembly);
                    resourceMan = temp;
                }
                return resourceMan;
            }
        }
        
        /// <summary>
        ///   Overrides the current thread's CurrentUICulture property for all
        ///   resource lookups using this strongly typed resource class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        public static global::System.Globalization.CultureInfo Culture {
            get {
                return resourceCulture;
            }
            set {
                resourceCulture = value;
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to The same artist cannot be added twice. Please remove the duplicate and edit the roles accordingly..
        /// </summary>
        public static string DuplicateArtist {
            get {
                return ResourceManager.GetString("DuplicateArtist", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Song needs at least one artist..
        /// </summary>
        public static string NeedArtist {
            get {
                return ResourceManager.GetString("NeedArtist", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Derived songs need to have an original version specified, if it&apos;s in the database, or the original needs to be mentioned in notes..
        /// </summary>
        public static string NeedOriginal {
            get {
                return ResourceManager.GetString("NeedOriginal", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Song should have at least one producer (composer, arranger or animator) role..
        /// </summary>
        public static string NeedProducer {
            get {
                return ResourceManager.GetString("NeedProducer", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Song needs notes, PVs or links for reference..
        /// </summary>
        public static string NeedReferences {
            get {
                return ResourceManager.GetString("NeedReferences", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Song type needs to be specified..
        /// </summary>
        public static string NeedType {
            get {
                return ResourceManager.GetString("NeedType", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to This song has no vocalists. Original instrumental songs need to be tagged with the &apos;instrumental&apos; tag. Instrumental (karaoke) versions of existing songs should use the &apos;Instrumental&apos; song type. Otherwise, add vocalists..
        /// </summary>
        public static string NonInstrumentalSongNeedsVocalists {
            get {
                return ResourceManager.GetString("NonInstrumentalSongNeedsVocalists", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to The same release event does not need to be specified for both the song and album..
        /// </summary>
        public static string RedundantEvent {
            get {
                return ResourceManager.GetString("RedundantEvent", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Producer&apos;s roles do not need to be specified when that producer is the only one..
        /// </summary>
        public static string RedundantRoles {
            get {
                return ResourceManager.GetString("RedundantRoles", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Song needs a primary name..
        /// </summary>
        public static string UnspecifiedNames {
            get {
                return ResourceManager.GetString("UnspecifiedNames", resourceCulture);
            }
        }
    }
}
