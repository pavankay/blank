using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class medicalproviderphone
    {
        public int Id { get; set; }
        public int MedicalProviderId { get; set; }
        public string Number { get; set; }
        public int PhoneTypeId { get; set; }
        public virtual medicalprovider medicalprovider { get; set; }
        public virtual phonetype phonetype { get; set; }
    }
}
