using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class addresstype
    {
        public addresstype()
        {
            this.medicalprovideraddresses = new List<medicalprovideraddress>();
            this.patientaddresses = new List<patientaddress>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<medicalprovideraddress> medicalprovideraddresses { get; set; }
        public virtual ICollection<patientaddress> patientaddresses { get; set; }
    }
}
