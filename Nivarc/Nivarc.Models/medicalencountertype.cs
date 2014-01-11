using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class medicalencountertype
    {
        public medicalencountertype()
        {
            this.medicalencounters = new List<medicalencounter>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<medicalencounter> medicalencounters { get; set; }
    }
}
