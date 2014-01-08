using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class medicalfacility
    {
        public medicalfacility()
        {
            this.medicalprovidermedicalfacilities = new List<medicalprovidermedicalfacility>();
            this.visits = new List<visit>();
            this.visits1 = new List<visit>();
        }

        public int Id { get; set; }
        public int TitleId { get; set; }
        public string WebUrl { get; set; }
        public virtual title title { get; set; }
        public virtual ICollection<medicalprovidermedicalfacility> medicalprovidermedicalfacilities { get; set; }
        public virtual ICollection<visit> visits { get; set; }
        public virtual ICollection<visit> visits1 { get; set; }
    }
}
