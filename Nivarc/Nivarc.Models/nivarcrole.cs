using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class nivarcrole
    {
        public nivarcrole()
        {
            this.nivarcusers = new List<nivarcuser>();
        }

        public int Id { get; set; }
        public string Description { get; set; }
        public virtual ICollection<nivarcuser> nivarcusers { get; set; }
    }
}
