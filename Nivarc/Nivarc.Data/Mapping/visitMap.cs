using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class visitMap : EntityTypeConfiguration<visit>
    {
        public visitMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            // Table & Column Mappings
            this.ToTable("visit", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.MedicalProviderId).HasColumnName("MedicalProviderId");
            this.Property(t => t.MedicalFacilityId).HasColumnName("MedicalFacilityId");
            this.Property(t => t.StartDateTime).HasColumnName("StartDateTime");
            this.Property(t => t.VisitTypeId).HasColumnName("VisitTypeId");
            this.Property(t => t.ReferredByMedicalProviderId).HasColumnName("ReferredByMedicalProviderId");
            this.Property(t => t.ReferredByMedicalFacilityId).HasColumnName("ReferredByMedicalFacilityId");

            // Relationships
            this.HasOptional(t => t.medicalfacility)
                .WithMany(t => t.visits)
                .HasForeignKey(d => d.ReferredByMedicalFacilityId);
            this.HasRequired(t => t.medicalfacility1)
                .WithMany(t => t.visits1)
                .HasForeignKey(d => d.MedicalFacilityId);
            this.HasRequired(t => t.medicalprovider)
                .WithMany(t => t.visits)
                .HasForeignKey(d => d.MedicalProviderId);
            this.HasOptional(t => t.medicalprovider1)
                .WithMany(t => t.visits1)
                .HasForeignKey(d => d.ReferredByMedicalProviderId);
            this.HasRequired(t => t.patient)
                .WithMany(t => t.visits)
                .HasForeignKey(d => d.PatientId);
            this.HasRequired(t => t.visittype)
                .WithMany(t => t.visits)
                .HasForeignKey(d => d.VisitTypeId);

        }
    }
}
