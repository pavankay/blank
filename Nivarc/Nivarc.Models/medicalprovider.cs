using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class medicalprovider
    {
        public medicalprovider()
        {
            this.medicalprovideraddresses = new List<medicalprovideraddress>();
            this.medicalprovideremails = new List<medicalprovideremail>();
            this.medicalprovidermedicalfacilities = new List<medicalprovidermedicalfacility>();
            this.medicalproviderphones = new List<medicalproviderphone>();
            this.patients = new List<patient>();
            this.visits = new List<visit>();
            this.visits1 = new List<visit>();
        }

        public int Id { get; set; }
        public int MedicalProviderTypeId { get; set; }
        public Nullable<int> TitleId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public Nullable<System.DateTime> DateOfBirth { get; set; }
        public int GenderId { get; set; }
        public string WebUrl { get; set; }
        public virtual gender gender { get; set; }
        public virtual medicalprovidertype medicalprovidertype { get; set; }
        public virtual title title { get; set; }
        public virtual ICollection<medicalprovideraddress> medicalprovideraddresses { get; set; }
        public virtual ICollection<medicalprovideremail> medicalprovideremails { get; set; }
        public virtual ICollection<medicalprovidermedicalfacility> medicalprovidermedicalfacilities { get; set; }
        public virtual ICollection<medicalproviderphone> medicalproviderphones { get; set; }
        public virtual ICollection<patient> patients { get; set; }
        public virtual ICollection<visit> visits { get; set; }
        public virtual ICollection<visit> visits1 { get; set; }
    }
}
