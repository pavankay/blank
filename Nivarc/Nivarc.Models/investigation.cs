using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class investigation
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public int InvestigationTypeId { get; set; }
    }
}
