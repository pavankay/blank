using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class labtest
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public Nullable<int> LabPanelId { get; set; }
        public virtual labpanel labpanel { get; set; }
    }
}
