using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class immunization
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int VaccineId { get; set; }
        public Nullable<int> DoseNumber { get; set; }
        public int AdministeredUnits { get; set; }
        public int ImmunizationRouteId { get; set; }
        public int ImmunizationSiteId { get; set; }
        public string SubstanceLotNumber { get; set; }
        public System.DateTime VaccinationDate { get; set; }
        public Nullable<int> OrderedProviderId { get; set; }
        public Nullable<int> AdministeredProviderId { get; set; }
        public string Note { get; set; }
        public virtual immunizationsite immunizationsite { get; set; }
        public virtual medicalprovider medicalprovider { get; set; }
        public virtual medicalprovider medicalprovider1 { get; set; }
        public virtual patient patient { get; set; }
        public virtual vaccine vaccine { get; set; }
    }
}
