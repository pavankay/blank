CREATE TABLE [dbo].[PatientEmail] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [PatientId]   INT           NOT NULL,
    [Number]      NVARCHAR (32) NOT NULL,
    [EmailTypeId] INT           NOT NULL,
    CONSTRAINT [PK_dbo_PatientEmail] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PatientEmail_EmailType] FOREIGN KEY ([EmailTypeId]) REFERENCES [dbo].[EmailType] ([Id]),
    CONSTRAINT [FK_PatientEmail_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id])
);

