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
    
    public partial class Gender
    {
        public Gender()
        {
            this.MedicalProviders = new HashSet<MedicalProvider>();
            this.Patients = new HashSet<Patient>();
        }
    
        public int Id { get; set; }
        public string Description { get; set; }
    
        public virtual ICollection<MedicalProvider> MedicalProviders { get; set; }
        public virtual ICollection<Patient> Patients { get; set; }
    }
}
