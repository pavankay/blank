CREATE TABLE [dbo].[MedicalProviderAddress] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [Line1]             NVARCHAR (MAX) NOT NULL,
    [Line2]             NVARCHAR (MAX) NULL,
    [City]              NVARCHAR (MAX) NOT NULL,
    [State]             NCHAR (2)      NOT NULL,
    [PostalCode]        NVARCHAR (32)  NULL,
    [MedicalProviderId] INT            NOT NULL,
    [AddressTypeId]     INT            NOT NULL,
    CONSTRAINT [PK_dbo_MedicalProviderAddress] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_MedicalProviderAddress_AddressType] FOREIGN KEY ([AddressTypeId]) REFERENCES [dbo].[AddressType] ([Id]),
    CONSTRAINT [FK_MedicalProviderAddress_MedicalProvider] FOREIGN KEY ([MedicalProviderId]) REFERENCES [dbo].[MedicalProvider] ([Id])
);

