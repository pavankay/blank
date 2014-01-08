using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class prescriptionMap : EntityTypeConfiguration<prescription>
    {
        public prescriptionMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Dosage)
                .HasMaxLength(100);

            // Table & Column Mappings
            this.ToTable("prescription", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.VisitId).HasColumnName("VisitId");
            this.Property(t => t.MedicationId).HasColumnName("MedicationId");
            this.Property(t => t.Dosage).HasColumnName("Dosage");
            this.Property(t => t.DosageUnitTypeId).HasColumnName("DosageUnitTypeId");

            // Relationships
            this.HasOptional(t => t.dosageunittype)
                .WithMany(t => t.prescriptions)
                .HasForeignKey(d => d.DosageUnitTypeId);
            this.HasRequired(t => t.medication)
                .WithMany(t => t.prescriptions)
                .HasForeignKey(d => d.MedicationId);
            this.HasOptional(t => t.patient)
                .WithMany(t => t.prescriptions)
                .HasForeignKey(d => d.PatientId);
            this.HasOptional(t => t.visit)
                .WithMany(t => t.prescriptions)
                .HasForeignKey(d => d.VisitId);

        }
    }
}
