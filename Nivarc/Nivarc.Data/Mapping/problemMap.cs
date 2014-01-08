using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class problemMap : EntityTypeConfiguration<problem>
    {
        public problemMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.SnoMedCode)
                .IsRequired()
                .HasMaxLength(100);

            this.Property(t => t.ICD9Code)
                .HasMaxLength(100);

            this.Property(t => t.ICD10Code)
                .HasMaxLength(100);

            // Table & Column Mappings
            this.ToTable("problem", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.SnoMedCode).HasColumnName("SnoMedCode");
            this.Property(t => t.ICD9Code).HasColumnName("ICD9Code");
            this.Property(t => t.ICD10Code).HasColumnName("ICD10Code");
        }
    }
}
