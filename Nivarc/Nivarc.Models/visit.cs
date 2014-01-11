using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class visit
    {
        public visit()
        {
            this.medicalencounters = new List<medicalencounter>();
            this.patientnotes = new List<patientnote>();
            this.prescriptions = new List<prescription>();
        }

        public int Id { get; set; }
        public int PatientId { get; set; }
        public int MedicalProviderId { get; set; }
        public int MedicalFacilityId { get; set; }
        public System.DateTime StartDateTime { get; set; }
        public int VisitTypeId { get; set; }
        public Nullable<int> ReferredByMedicalProviderId { get; set; }
        public Nullable<int> ReferredByMedicalFacilityId { get; set; }
        public virtual ICollection<medicalencounter> medicalencounters { get; set; }
        public virtual medicalfacility medicalfacility { get; set; }
        public virtual medicalfacility medicalfacility1 { get; set; }
        public virtual medicalprovider medicalprovider { get; set; }
        public virtual medicalprovider medicalprovider1 { get; set; }
        public virtual patient patient { get; set; }
        public virtual ICollection<patientnote> patientnotes { get; set; }
        public virtual ICollection<prescription> prescriptions { get; set; }
    }
}
