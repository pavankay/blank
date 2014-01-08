using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientnoteMap : EntityTypeConfiguration<patientnote>
    {
        public patientnoteMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

            this.Property(t => t.NotesText)
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("patientnotes", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.VisitId).HasColumnName("VisitId");
            this.Property(t => t.MedicalProviderId).HasColumnName("MedicalProviderId");
            this.Property(t => t.NotesDateTime).HasColumnName("NotesDateTime");
            this.Property(t => t.NotesText).HasColumnName("NotesText");

            // Relationships
            this.HasOptional(t => t.visit)
                .WithMany(t => t.patientnotes)
                .HasForeignKey(d => d.VisitId);

        }
    }
}
