CREATE TABLE [dbo].[PatientPersonIdentifier] (
    [Id]                     INT           NOT NULL,
    [PatientId]              INT           NOT NULL,
    [PersonIdentifierTypeId] INT           NOT NULL,
    [Number]                 NVARCHAR (50) NULL,
    CONSTRAINT [PK_PatientPersonIdentifier] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PatientPersonIdentifier_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id]),
    CONSTRAINT [FK_PatientPersonIdentifier_PersonIdentifierType] FOREIGN KEY ([PersonIdentifierTypeId]) REFERENCES [dbo].[PersonIdentifierType] ([Id])
);

