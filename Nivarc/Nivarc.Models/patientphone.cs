using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientphone
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Number { get; set; }
        public int PhoneTypeId { get; set; }
        public virtual patient patient { get; set; }
        public virtual phonetype phonetype { get; set; }
    }
}
