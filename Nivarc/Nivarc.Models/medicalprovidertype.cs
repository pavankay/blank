using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class medicalprovidertype
    {
        public medicalprovidertype()
        {
            this.medicalproviders = new List<medicalprovider>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<medicalprovider> medicalproviders { get; set; }
    }
}
