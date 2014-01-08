using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class dosageunittype
    {
        public dosageunittype()
        {
            this.prescriptions = new List<prescription>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<prescription> prescriptions { get; set; }
    }
}
