using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientpersonidentifierMap : EntityTypeConfiguration<patientpersonidentifier>
    {
        public patientpersonidentifierMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

            this.Property(t => t.Number)
                .HasMaxLength(100);

            // Table & Column Mappings
            this.ToTable("patientpersonidentifier", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.PersonIdentifierTypeId).HasColumnName("PersonIdentifierTypeId");
            this.Property(t => t.Number).HasColumnName("Number");

            // Relationships
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientpersonidentifiers)
                .HasForeignKey(d => d.PatientId);
            this.HasRequired(t => t.personidentifiertype)
                .WithMany(t => t.patientpersonidentifiers)
                .HasForeignKey(d => d.PersonIdentifierTypeId);

        }
    }
}
