using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientproblem
    {
        public patientproblem()
        {
            this.medicalencounters = new List<medicalencounter>();
        }

        public int Id { get; set; }
        public int PatientId { get; set; }
        public int ProblemId { get; set; }
        public Nullable<System.DateTime> OnsetDate { get; set; }
        public virtual ICollection<medicalencounter> medicalencounters { get; set; }
        public virtual patient patient { get; set; }
        public virtual problem problem { get; set; }
    }
}
