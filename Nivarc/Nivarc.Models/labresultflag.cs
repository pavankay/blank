using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class labresultflag
    {
        public labresultflag()
        {
            this.vitalsignobservations = new List<vitalsignobservation>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<vitalsignobservation> vitalsignobservations { get; set; }
    }
}
