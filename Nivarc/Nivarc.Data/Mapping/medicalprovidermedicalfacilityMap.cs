using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class medicalprovidermedicalfacilityMap : EntityTypeConfiguration<medicalprovidermedicalfacility>
    {
        public medicalprovidermedicalfacilityMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            // Table & Column Mappings
            this.ToTable("medicalprovidermedicalfacility", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.MedicalProviderId).HasColumnName("MedicalProviderId");
            this.Property(t => t.MedicalFacilityId).HasColumnName("MedicalFacilityId");
            this.Property(t => t.JobRoleId).HasColumnName("JobRoleId");

            // Relationships
            this.HasRequired(t => t.jobrole)
                .WithMany(t => t.medicalprovidermedicalfacilities)
                .HasForeignKey(d => d.JobRoleId);
            this.HasRequired(t => t.medicalfacility)
                .WithMany(t => t.medicalprovidermedicalfacilities)
                .HasForeignKey(d => d.MedicalFacilityId);
            this.HasRequired(t => t.medicalprovider)
                .WithMany(t => t.medicalprovidermedicalfacilities)
                .HasForeignKey(d => d.MedicalProviderId);

        }
    }
}
