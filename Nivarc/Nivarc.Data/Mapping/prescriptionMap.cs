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
            // Table & Column Mappings
            this.ToTable("prescription", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.MedicalEncounterId).HasColumnName("MedicalEncounterId");

            // Relationships
            this.HasOptional(t => t.medicalencounter)
                .WithMany(t => t.prescriptions)
                .HasForeignKey(d => d.MedicalEncounterId);
            this.HasOptional(t => t.patient)
                .WithMany(t => t.prescriptions)
                .HasForeignKey(d => d.PatientId);

        }
    }
}
