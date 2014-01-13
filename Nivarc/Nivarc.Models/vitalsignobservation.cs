using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class vitalsignobservation
    {
        public int Id { get; set; }
        public int EncounterId { get; set; }
        public int VitalSignCodeId { get; set; }
        public Nullable<double> Value { get; set; }
        public Nullable<int> LabResultUnitId { get; set; }
        public Nullable<int> LabResultFlagId { get; set; }
        public Nullable<int> LabResultStatusId { get; set; }
        public Nullable<double> ReferenceMinimum { get; set; }
        public Nullable<double> ReferenceMaximum { get; set; }
        public System.DateTime ObservationDate { get; set; }
        public string TextValue { get; set; }
        public string Notes { get; set; }
        public virtual labresultflag labresultflag { get; set; }
        public virtual labresultstatu labresultstatu { get; set; }
        public virtual labresultunit labresultunit { get; set; }
        public virtual medicalencounter medicalencounter { get; set; }
        public virtual vitalsigncode vitalsigncode { get; set; }
    }
}
