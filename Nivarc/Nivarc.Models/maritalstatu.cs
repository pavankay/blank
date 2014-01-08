using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class maritalstatu
    {
        public maritalstatu()
        {
            this.patients = new List<patient>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<patient> patients { get; set; }
    }
}
