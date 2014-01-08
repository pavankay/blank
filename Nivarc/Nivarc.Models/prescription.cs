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
        public Nullable<int> VisitId { get; set; }
        public int MedicationId { get; set; }
        public string Dosage { get; set; }
        public Nullable<int> DosageUnitTypeId { get; set; }
        public virtual dosageunittype dosageunittype { get; set; }
        public virtual medication medication { get; set; }
        public virtual patient patient { get; set; }
        public virtual ICollection<patientmedication> patientmedications { get; set; }
        public virtual visit visit { get; set; }
    }
}
