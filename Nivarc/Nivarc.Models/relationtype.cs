using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class relationtype
    {
        public relationtype()
        {
            this.patientrelativeproblems = new List<patientrelativeproblem>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<patientrelativeproblem> patientrelativeproblems { get; set; }
    }
}
