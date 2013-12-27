CREATE TABLE [dbo].[Patient] (
    [Id]                    INT            IDENTITY (1, 1) NOT NULL,
    [Title]                 NVARCHAR (50)  NULL,
    [FirstName]             NVARCHAR (MAX) NULL,
    [LastName]              NVARCHAR (MAX) NULL,
    [MiddleName]            NVARCHAR (50)  NULL,
    [DateOfBirth]           DATE           NULL,
    [DateOfDeath]           DATE           NULL,
    [MaritalStatusId]       INT            NULL,
    [PrimaryCareProviderId] INT            NULL,
    [GenderId]              INT            NOT NULL,
    CONSTRAINT [PK_Patient] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Patient_MaritialStatus] FOREIGN KEY ([MaritalStatusId]) REFERENCES [dbo].[MaritialStatus] ([Id]),
    CONSTRAINT [FK_Patient_MedicalProvider] FOREIGN KEY ([PrimaryCareProviderId]) REFERENCES [dbo].[MedicalProvider] ([Id])
);

