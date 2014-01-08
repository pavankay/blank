using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class medicalfacilityMap : EntityTypeConfiguration<medicalfacility>
    {
        public medicalfacilityMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.WebUrl)
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("medicalfacility", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.TitleId).HasColumnName("TitleId");
            this.Property(t => t.WebUrl).HasColumnName("WebUrl");

            // Relationships
            this.HasRequired(t => t.title)
                .WithMany(t => t.medicalfacilities)
                .HasForeignKey(d => d.TitleId);

        }
    }
}
