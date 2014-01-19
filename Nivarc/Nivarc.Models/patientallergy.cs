using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientallergy
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public int PatientId { get; set; }
        public int AllergyTypeId { get; set; }
        public Nullable<int> AllergyReactionId { get; set; }
        public Nullable<System.DateTime> FirstObserved { get; set; }
        public virtual allergyreaction allergyreaction { get; set; }
        public virtual allergytype allergytype { get; set; }
        public virtual patient patient { get; set; }
    }
}
