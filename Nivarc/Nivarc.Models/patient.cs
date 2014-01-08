using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patient
    {
        public patient()
        {
            this.patientaddresses = new List<patientaddress>();
            this.patientallergies = new List<patientallergy>();
            this.patientemails = new List<patientemail>();
            this.patientmedications = new List<patientmedication>();
            this.patientpersonidentifiers = new List<patientpersonidentifier>();
            this.patientphones = new List<patientphone>();
            this.patientproblems = new List<patientproblem>();
            this.patientrelativeproblems = new List<patientrelativeproblem>();
            this.prescriptions = new List<prescription>();
            this.visits = new List<visit>();
        }

        public int Id { get; set; }
        public Nullable<int> TitleId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public Nullable<System.DateTime> DateOfBirth { get; set; }
        public Nullable<System.DateTime> DateOfDeath { get; set; }
        public Nullable<int> MaritalStatusId { get; set; }
        public Nullable<int> PrimaryCareProviderId { get; set; }
        public int GenderId { get; set; }
        public virtual gender gender { get; set; }
        public virtual maritalstatu maritalstatu { get; set; }
        public virtual medicalprovider medicalprovider { get; set; }
        public virtual title title { get; set; }
        public virtual ICollection<patientaddress> patientaddresses { get; set; }
        public virtual ICollection<patientallergy> patientallergies { get; set; }
        public virtual ICollection<patientemail> patientemails { get; set; }
        public virtual ICollection<patientmedication> patientmedications { get; set; }
        public virtual ICollection<patientpersonidentifier> patientpersonidentifiers { get; set; }
        public virtual ICollection<patientphone> patientphones { get; set; }
        public virtual ICollection<patientproblem> patientproblems { get; set; }
        public virtual ICollection<patientrelativeproblem> patientrelativeproblems { get; set; }
        public virtual ICollection<prescription> prescriptions { get; set; }
        public virtual ICollection<visit> visits { get; set; }
    }
}
