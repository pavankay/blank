using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class title
    {
        public title()
        {
            this.medicalfacilities = new List<medicalfacility>();
            this.medicalproviders = new List<medicalprovider>();
            this.patients = new List<patient>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<medicalfacility> medicalfacilities { get; set; }
        public virtual ICollection<medicalprovider> medicalproviders { get; set; }
        public virtual ICollection<patient> patients { get; set; }
    }
}
