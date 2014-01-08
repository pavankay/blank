using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientmedication
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int MedicationId { get; set; }
        public Nullable<int> PrescriptionId { get; set; }
        public virtual medication medication { get; set; }
        public virtual patient patient { get; set; }
        public virtual prescription prescription { get; set; }
    }
}
