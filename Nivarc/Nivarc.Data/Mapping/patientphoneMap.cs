using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientphoneMap : EntityTypeConfiguration<patientphone>
    {
        public patientphoneMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Number)
                .IsRequired()
                .HasMaxLength(64);

            // Table & Column Mappings
            this.ToTable("patientphone", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.Number).HasColumnName("Number");
            this.Property(t => t.PhoneTypeId).HasColumnName("PhoneTypeId");

            // Relationships
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientphones)
                .HasForeignKey(d => d.PatientId);
            this.HasRequired(t => t.phonetype)
                .WithMany(t => t.patientphones)
                .HasForeignKey(d => d.PhoneTypeId);

        }
    }
}
