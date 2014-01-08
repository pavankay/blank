using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientproblem
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int ProblemId { get; set; }
        public virtual patient patient { get; set; }
        public virtual problem problem { get; set; }
    }
}
