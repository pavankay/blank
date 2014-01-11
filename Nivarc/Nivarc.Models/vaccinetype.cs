using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class vaccinetype
    {
        public vaccinetype()
        {
            this.vaccines = new List<vaccine>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<vaccine> vaccines { get; set; }
    }
}
