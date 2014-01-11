using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class dosevalue
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string exatdose { get; set; }
        public string mindose { get; set; }
        public string maxdose { get; set; }
    }
}
