using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class prescription
    {
        public prescription()
        {
            this.patientmedications = new List<patientmedication>();
        }

        public int Id { get; set; }
        public Nullable<int> PatientId { get; set; }
        public Nullable<int> MedicalEncounterId { get; set; }
        public virtual medicalencounter medicalencounter { get; set; }
        public virtual patient patient { get; set; }
        public virtual ICollection<patientmedication> patientmedications { get; set; }
    }
}
