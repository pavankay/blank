using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class labpanel
    {
        public labpanel()
        {
            this.labtests = new List<labtest>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<labtest> labtests { get; set; }
    }
}
