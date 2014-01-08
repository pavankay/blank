using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class emailtype
    {
        public emailtype()
        {
            this.medicalprovideremails = new List<medicalprovideremail>();
            this.patientemails = new List<patientemail>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<medicalprovideremail> medicalprovideremails { get; set; }
        public virtual ICollection<patientemail> patientemails { get; set; }
    }
}
