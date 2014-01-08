using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientrelativeproblem
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int ProblemId { get; set; }
        public int RelationTypeId { get; set; }
        public virtual patient patient { get; set; }
        public virtual problem problem { get; set; }
        public virtual relationtype relationtype { get; set; }
    }
}
