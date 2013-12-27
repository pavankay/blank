CREATE TABLE [dbo].[PatientPhone] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [PatientId]   INT           NOT NULL,
    [Number]      NVARCHAR (32) NOT NULL,
    [PhoneTypeId] INT           NOT NULL,
    CONSTRAINT [PK_dbo_PatientPhone] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PatientPhone_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id]),
    CONSTRAINT [FK_PatientPhone_PhoneType] FOREIGN KEY ([PhoneTypeId]) REFERENCES [dbo].[PhoneType] ([Id])
);

