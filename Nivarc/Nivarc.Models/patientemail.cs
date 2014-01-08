using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class patientemail
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Number { get; set; }
        public int EmailTypeId { get; set; }
        public virtual emailtype emailtype { get; set; }
        public virtual patient patient { get; set; }
    }
}
