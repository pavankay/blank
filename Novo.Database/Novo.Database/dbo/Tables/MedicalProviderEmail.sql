CREATE TABLE [dbo].[MedicalProviderEmail] (
    [Id]                INT           IDENTITY (1, 1) NOT NULL,
    [MedicalProviderId] INT           NOT NULL,
    [Number]            NVARCHAR (32) NOT NULL,
    [EmailTypeId]       INT           NOT NULL,
    CONSTRAINT [PK_dbo_MedicalProviderEmail] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_MedicalProviderEmail_EmailType] FOREIGN KEY ([EmailTypeId]) REFERENCES [dbo].[EmailType] ([Id]),
    CONSTRAINT [FK_MedicalProviderEmail_MedicalProvider] FOREIGN KEY ([MedicalProviderId]) REFERENCES [dbo].[MedicalProvider] ([Id])
);

