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
    
    public partial class MedicalProviderType
    {
        public MedicalProviderType()
        {
            this.MedicalProviders = new HashSet<MedicalProvider>();
        }
    
        public int Id { get; set; }
        public string Description { get; set; }
    
        public virtual ICollection<MedicalProvider> MedicalProviders { get; set; }
    }
}
