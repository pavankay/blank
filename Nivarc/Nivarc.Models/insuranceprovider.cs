using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class insuranceprovider
    {
        public insuranceprovider()
        {
            this.patientinsurances = new List<patientinsurance>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<patientinsurance> patientinsurances { get; set; }
    }
}
