using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientnote
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Nullable<int> VisitId { get; set; }
        public int MedicalProviderId { get; set; }
        public System.DateTime NotesDateTime { get; set; }
        public string NotesText { get; set; }
        public virtual visit visit { get; set; }
    }
}
