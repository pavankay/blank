using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class medicalencounterMap : EntityTypeConfiguration<medicalencounter>
    {
        public medicalencounterMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Notes)
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("medicalencounter", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.VisitId).HasColumnName("VisitId");
            this.Property(t => t.MedicalEncounterTypeId).HasColumnName("MedicalEncounterTypeId");
            this.Property(t => t.MedicalEncounterPurposeId).HasColumnName("MedicalEncounterPurposeId");
            this.Property(t => t.PatientProblemID).HasColumnName("PatientProblemID");
            this.Property(t => t.MedicalProviderId).HasColumnName("MedicalProviderId");
            this.Property(t => t.Notes).HasColumnName("Notes");

            // Relationships
            this.HasOptional(t => t.medicalencounterpurpose)
                .WithMany(t => t.medicalencounters)
                .HasForeignKey(d => d.MedicalEncounterPurposeId);
            this.HasRequired(t => t.medicalencountertype)
                .WithMany(t => t.medicalencounters)
                .HasForeignKey(d => d.MedicalEncounterTypeId);
            this.HasOptional(t => t.medicalprovider)
                .WithMany(t => t.medicalencounters)
                .HasForeignKey(d => d.MedicalProviderId);
            this.HasOptional(t => t.patientproblem)
                .WithMany(t => t.medicalencounters)
                .HasForeignKey(d => d.PatientProblemID);
            this.HasRequired(t => t.visit)
                .WithMany(t => t.medicalencounters)
                .HasForeignKey(d => d.VisitId);

        }
    }
}
