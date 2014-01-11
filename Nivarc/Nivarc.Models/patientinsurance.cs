using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientinsurance
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int InsuranceProviderId { get; set; }
        public Nullable<int> InsurancePlanTypeId { get; set; }
        public string InsurancePlanId { get; set; }
        public Nullable<System.DateTime> PlanEffectiveDate { get; set; }
        public Nullable<System.DateTime> PlanExpirationDate { get; set; }
        public virtual insuranceplantype insuranceplantype { get; set; }
        public virtual insuranceprovider insuranceprovider { get; set; }
        public virtual patient patient { get; set; }
    }
}
