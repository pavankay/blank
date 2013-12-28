CREATE TABLE [dbo].[PatientAddress] (
    [Id]            INT            IDENTITY (1, 1) NOT NULL,
    [Line1]         NVARCHAR (MAX) NOT NULL,
    [Line2]         NVARCHAR (MAX) NULL,
    [City]          NVARCHAR (MAX) NOT NULL,
    [State]         NCHAR (2)      NOT NULL,
    [PostalCode]    NVARCHAR (32)  NULL,
    [PatientId]     INT            NOT NULL,
    [AddressTypeId] INT            NOT NULL,
    CONSTRAINT [PK_dbo_PatientAddress] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PatientAddress_AddressType] FOREIGN KEY ([AddressTypeId]) REFERENCES [dbo].[AddressType] ([Id]),
    CONSTRAINT [FK_PatientAddress_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id])
);

