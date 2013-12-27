CREATE TABLE [dbo].[MedicalProviderPhone] (
    [Id]                INT           IDENTITY (1, 1) NOT NULL,
    [MedicalProviderId] INT           NOT NULL,
    [Number]            NVARCHAR (32) NOT NULL,
    [PhoneTypeId]       INT           NOT NULL,
    CONSTRAINT [PK_dbo_MedicalProviderPhone] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_MedicalProviderPhone_MedicalProvider] FOREIGN KEY ([MedicalProviderId]) REFERENCES [dbo].[MedicalProvider] ([Id]),
    CONSTRAINT [FK_MedicalProviderPhone_PhoneType] FOREIGN KEY ([PhoneTypeId]) REFERENCES [dbo].[PhoneType] ([Id])
);

