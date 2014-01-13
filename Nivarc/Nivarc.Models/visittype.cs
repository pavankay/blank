using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class visittype
    {
        public visittype()
        {
            this.vaccines = new List<vaccine>();
            this.visits = new List<visit>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<vaccine> vaccines { get; set; }
        public virtual ICollection<visit> visits { get; set; }
    }
}
