using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class medicalprovidermedicalfacility
    {
        public int Id { get; set; }
        public int MedicalProviderId { get; set; }
        public int MedicalFacilityId { get; set; }
        public int JobRoleId { get; set; }
        public virtual jobrole jobrole { get; set; }
        public virtual medicalfacility medicalfacility { get; set; }
        public virtual medicalprovider medicalprovider { get; set; }
    }
}
