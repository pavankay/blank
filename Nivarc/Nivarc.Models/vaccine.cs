using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class vaccine
    {
        public vaccine()
        {
            this.immunizations = new List<immunization>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public int VaccineTypeId { get; set; }
        public Nullable<int> MaxNoOfDoses { get; set; }
        public virtual ICollection<immunization> immunizations { get; set; }
        public virtual vaccinetype vaccinetype { get; set; }
    }
}
