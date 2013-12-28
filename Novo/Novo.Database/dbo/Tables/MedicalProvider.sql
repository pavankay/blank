CREATE TABLE [dbo].[MedicalProvider] (
    [Id]                    INT            IDENTITY (1, 1) NOT NULL,
    [MedicalProviderTypeId] INT            NOT NULL,
    [Title]                 NVARCHAR (50)  NULL,
    [FirstName]             NVARCHAR (MAX) NULL,
    [LastName]              NVARCHAR (MAX) NULL,
    [MiddleName]            NVARCHAR (50)  NULL,
    [DateOfBirth]           DATE           NULL,
    [GenderId]              INT            NOT NULL,
    [WebUrl]                NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Provider] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_MedicalProvider_Gender] FOREIGN KEY ([GenderId]) REFERENCES [dbo].[Gender] ([Id]),
    CONSTRAINT [FK_MedicalProvider_MedicalProviderType] FOREIGN KEY ([MedicalProviderTypeId]) REFERENCES [dbo].[MedicalProviderType] ([Id])
);

