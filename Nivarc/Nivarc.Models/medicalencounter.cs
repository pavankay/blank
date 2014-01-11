using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class medicalencounter
    {
        public medicalencounter()
        {
            this.vitalsignobservations = new List<vitalsignobservation>();
        }

        public int Id { get; set; }
        public int VisitId { get; set; }
        public int MedicalEncounterTypeId { get; set; }
        public Nullable<int> MedicalEncounterPurposeId { get; set; }
        public Nullable<int> PatientProblemID { get; set; }
        public Nullable<int> MedicalProviderId { get; set; }
        public string Notes { get; set; }
        public virtual medicalencounterpurpose medicalencounterpurpose { get; set; }
        public virtual medicalencountertype medicalencountertype { get; set; }
        public virtual medicalprovider medicalprovider { get; set; }
        public virtual patientproblem patientproblem { get; set; }
        public virtual visit visit { get; set; }
        public virtual ICollection<vitalsignobservation> vitalsignobservations { get; set; }
    }
}
