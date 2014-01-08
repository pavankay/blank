using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientaddressMap : EntityTypeConfiguration<patientaddress>
    {
        public patientaddressMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Line1)
                .IsRequired()
                .HasMaxLength(1073741823);

            this.Property(t => t.Line2)
                .HasMaxLength(1073741823);

            this.Property(t => t.City)
                .IsRequired()
                .HasMaxLength(1073741823);

            this.Property(t => t.State)
                .IsRequired()
                .HasMaxLength(4);

            this.Property(t => t.PostalCode)
                .HasMaxLength(64);

            // Table & Column Mappings
            this.ToTable("patientaddress", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Line1).HasColumnName("Line1");
            this.Property(t => t.Line2).HasColumnName("Line2");
            this.Property(t => t.City).HasColumnName("City");
            this.Property(t => t.State).HasColumnName("State");
            this.Property(t => t.PostalCode).HasColumnName("PostalCode");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.AddressTypeId).HasColumnName("AddressTypeId");

            // Relationships
            this.HasRequired(t => t.addresstype)
                .WithMany(t => t.patientaddresses)
                .HasForeignKey(d => d.AddressTypeId);
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientaddresses)
                .HasForeignKey(d => d.PatientId);

        }
    }
}
