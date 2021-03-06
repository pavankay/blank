using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientaddress
    {
        public int Id { get; set; }
        public string Line1 { get; set; }
        public string Line2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public int PatientId { get; set; }
        public int AddressTypeId { get; set; }
        public virtual addresstype addresstype { get; set; }
        public virtual patient patient { get; set; }
    }
}
