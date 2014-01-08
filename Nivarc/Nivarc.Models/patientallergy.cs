using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientallergy
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int AllergyId { get; set; }
        public virtual allergy allergy { get; set; }
        public virtual patient patient { get; set; }
    }
}
