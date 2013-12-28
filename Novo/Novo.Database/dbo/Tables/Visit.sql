CREATE TABLE [dbo].[Visit] (
    [Id]                          INT      IDENTITY (1, 1) NOT NULL,
    [PatientId]                   INT      NOT NULL,
    [MedicalProviderId]           INT      NOT NULL,
    [MedicalFacilityId]           INT      NOT NULL,
    [StartDateTime]               DATETIME NOT NULL,
    [VisitTypeId]                 INT      NOT NULL,
    [ReferredByMedicalProviderId] INT      NULL,
    [ReferredByMedicalFacilityId] INT      NULL,
    CONSTRAINT [PK_Visit] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Visit_MedicalFacility] FOREIGN KEY ([ReferredByMedicalFacilityId]) REFERENCES [dbo].[MedicalFacility] ([Id]),
    CONSTRAINT [FK_Visit_MedicalFacility1] FOREIGN KEY ([MedicalFacilityId]) REFERENCES [dbo].[MedicalFacility] ([Id]),
    CONSTRAINT [FK_Visit_MedicalProvider] FOREIGN KEY ([MedicalProviderId]) REFERENCES [dbo].[MedicalProvider] ([Id]),
    CONSTRAINT [FK_Visit_MedicalProvider1] FOREIGN KEY ([ReferredByMedicalProviderId]) REFERENCES [dbo].[MedicalProvider] ([Id]),
    CONSTRAINT [FK_Visit_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id])
);

