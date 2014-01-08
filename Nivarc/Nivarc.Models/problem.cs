using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class problem
    {
        public problem()
        {
            this.patientproblems = new List<patientproblem>();
            this.patientrelativeproblems = new List<patientrelativeproblem>();
        }

        public int Id { get; set; }
        public string SnoMedCode { get; set; }
        public string ICD9Code { get; set; }
        public string ICD10Code { get; set; }
        public virtual ICollection<patientproblem> patientproblems { get; set; }
        public virtual ICollection<patientrelativeproblem> patientrelativeproblems { get; set; }
    }
}
