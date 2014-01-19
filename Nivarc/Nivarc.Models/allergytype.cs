using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class allergytype
    {
        public allergytype()
        {
            this.patientallergies = new List<patientallergy>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<patientallergy> patientallergies { get; set; }
    }
}
