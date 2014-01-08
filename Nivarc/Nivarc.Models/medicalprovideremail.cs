using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class medicalprovideremail
    {
        public int Id { get; set; }
        public int MedicalProviderId { get; set; }
        public string Number { get; set; }
        public int EmailTypeId { get; set; }
        public virtual emailtype emailtype { get; set; }
        public virtual medicalprovider medicalprovider { get; set; }
    }
}
