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
    
    public partial class PatientMedication
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int MedicationId { get; set; }
        public Nullable<int> PrescriptionId { get; set; }
    
        public virtual Medication Medication { get; set; }
        public virtual Patient Patient { get; set; }
        public virtual Prescription Prescription { get; set; }
    }
}
