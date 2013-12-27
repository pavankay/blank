CREATE TABLE [dbo].[MedicalProviderMedicalFacility] (
    [Id]                INT IDENTITY (1, 1) NOT NULL,
    [MedicalProviderId] INT NOT NULL,
    [MedicalFacilityId] INT NOT NULL,
    [JobRoleId]         INT NOT NULL,
    CONSTRAINT [PK_ProviderMedicalFacilityJobRole] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_MedicalProviderMedicalFacility_JobRole] FOREIGN KEY ([JobRoleId]) REFERENCES [dbo].[JobRole] ([Id]),
    CONSTRAINT [FK_MedicalProviderMedicalFacility_MedicalFacility] FOREIGN KEY ([MedicalFacilityId]) REFERENCES [dbo].[MedicalFacility] ([Id]),
    CONSTRAINT [FK_MedicalProviderMedicalFacility_MedicalProvider] FOREIGN KEY ([MedicalProviderId]) REFERENCES [dbo].[MedicalProvider] ([Id])
);

