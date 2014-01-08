using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class jobrole
    {
        public jobrole()
        {
            this.medicalprovidermedicalfacilities = new List<medicalprovidermedicalfacility>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<medicalprovidermedicalfacility> medicalprovidermedicalfacilities { get; set; }
    }
}
