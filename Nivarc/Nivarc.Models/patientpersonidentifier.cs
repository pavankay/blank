using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientpersonidentifier
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int PersonIdentifierTypeId { get; set; }
        public string Number { get; set; }
        public virtual patient patient { get; set; }
        public virtual personidentifiertype personidentifiertype { get; set; }
    }
}
