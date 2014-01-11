using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class immunizationsite
    {
        public immunizationsite()
        {
            this.immunizations = new List<immunization>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<immunization> immunizations { get; set; }
    }
}
