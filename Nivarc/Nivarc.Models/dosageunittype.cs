using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class dosageunittype
    {
        public dosageunittype()
        {
            this.patientmedications = new List<patientmedication>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<patientmedication> patientmedications { get; set; }
    }
}
