using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class labtestMap : EntityTypeConfiguration<labtest>
    {
        public labtestMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Description)
                .IsRequired()
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("labtest", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Description).HasColumnName("Description");
            this.Property(t => t.LabPanelId).HasColumnName("LabPanelId");

            // Relationships
            this.HasOptional(t => t.labpanel)
                .WithMany(t => t.labtests)
                .HasForeignKey(d => d.LabPanelId);

        }
    }
}
