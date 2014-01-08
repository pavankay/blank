using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    [NivarcCache]
    public partial class gender
    {
        public gender()
        {
            this.medicalproviders = new List<medicalprovider>();
            this.patients = new List<patient>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<medicalprovider> medicalproviders { get; set; }
        public virtual ICollection<patient> patients { get; set; }
    }
}
