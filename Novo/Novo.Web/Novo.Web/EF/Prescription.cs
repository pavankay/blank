//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Novo.Web.EF
{
    using System;
    using System.Collections.Generic;
    
    public partial class Prescription
    {
        public Prescription()
        {
            this.PatientMedications = new HashSet<PatientMedication>();
        }
    
        public int Id { get; set; }
        public Nullable<int> PatientId { get; set; }
        public Nullable<int> VisitId { get; set; }
        public int MedicationId { get; set; }
        public string Dosage { get; set; }
        public Nullable<int> DosageUnitTypeId { get; set; }
    
        public virtual DosageUnitType DosageUnitType { get; set; }
        public virtual Medication Medication { get; set; }
        public virtual Patient Patient { get; set; }
        public virtual ICollection<PatientMedication> PatientMedications { get; set; }
        public virtual Visit Visit { get; set; }
    }
}