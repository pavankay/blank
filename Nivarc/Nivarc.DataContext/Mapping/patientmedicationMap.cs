using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientmedicationMap : EntityTypeConfiguration<patientmedication>
    {
        public patientmedicationMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            // Table & Column Mappings
            this.ToTable("patientmedication", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.MedicationId).HasColumnName("MedicationId");
            this.Property(t => t.PrescriptionId).HasColumnName("PrescriptionId");

            // Relationships
            this.HasRequired(t => t.medication)
                .WithMany(t => t.patientmedications)
                .HasForeignKey(d => d.MedicationId);
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientmedications)
                .HasForeignKey(d => d.PatientId);
            this.HasOptional(t => t.prescription)
                .WithMany(t => t.patientmedications)
                .HasForeignKey(d => d.PrescriptionId);

        }
    }
}
