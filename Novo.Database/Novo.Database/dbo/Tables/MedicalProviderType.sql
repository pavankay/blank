CREATE TABLE [dbo].[MedicalProviderType] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_MedicalProviderType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

