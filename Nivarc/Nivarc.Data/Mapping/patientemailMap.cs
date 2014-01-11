using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientemailMap : EntityTypeConfiguration<patientemail>
    {
        public patientemailMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.EmailAddress)
                .IsRequired()
                .HasMaxLength(200);

            // Table & Column Mappings
            this.ToTable("patientemail", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.EmailAddress).HasColumnName("EmailAddress");
            this.Property(t => t.EmailTypeId).HasColumnName("EmailTypeId");

            // Relationships
            this.HasRequired(t => t.emailtype)
                .WithMany(t => t.patientemails)
                .HasForeignKey(d => d.EmailTypeId);
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientemails)
                .HasForeignKey(d => d.PatientId);

        }
    }
}
