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
            this.Property(t => t.FacilityName)
                .IsRequired()
                .HasMaxLength(1073741823);

            this.Property(t => t.WebUrl)
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("medicalfacility", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.FacilityName).HasColumnName("FacilityName");
            this.Property(t => t.WebUrl).HasColumnName("WebUrl");
        }
    }
}
