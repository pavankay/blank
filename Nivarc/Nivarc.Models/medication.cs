using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class medication
    {
        public medication()
        {
            this.patientmedications = new List<patientmedication>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public string Brand { get; set; }
        public string Strength { get; set; }
        public virtual ICollection<patientmedication> patientmedications { get; set; }
    }
}
