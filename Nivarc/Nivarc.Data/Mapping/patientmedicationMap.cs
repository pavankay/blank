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
            this.Property(t => t.Dosage)
                .HasMaxLength(1073741823);

            this.Property(t => t.Frequency)
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("patientmedication", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.MedicationId).HasColumnName("MedicationId");
            this.Property(t => t.Dosage).HasColumnName("Dosage");
            this.Property(t => t.DosageUnitTypeId).HasColumnName("DosageUnitTypeId");
            this.Property(t => t.Frequency).HasColumnName("Frequency");
            this.Property(t => t.PrescriptionId).HasColumnName("PrescriptionId");

            // Relationships
            this.HasOptional(t => t.dosageunittype)
                .WithMany(t => t.patientmedications)
                .HasForeignKey(d => d.DosageUnitTypeId);
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
