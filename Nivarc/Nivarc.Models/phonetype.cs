using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class phonetype
    {
        public phonetype()
        {
            this.medicalproviderphones = new List<medicalproviderphone>();
            this.patientphones = new List<patientphone>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<medicalproviderphone> medicalproviderphones { get; set; }
        public virtual ICollection<patientphone> patientphones { get; set; }
    }
}
