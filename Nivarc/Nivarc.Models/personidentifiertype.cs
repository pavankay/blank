using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class personidentifiertype
    {
        public personidentifiertype()
        {
            this.patientpersonidentifiers = new List<patientpersonidentifier>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<patientpersonidentifier> patientpersonidentifiers { get; set; }
    }
}
