using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class labresultflagMap : EntityTypeConfiguration<labresultflag>
    {
        public labresultflagMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Description)
                .IsRequired()
                .HasMaxLength(100);

            // Table & Column Mappings
            this.ToTable("labresultflag", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Description).HasColumnName("Description");
        }
    }
}
