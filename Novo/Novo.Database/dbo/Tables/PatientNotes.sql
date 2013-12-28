CREATE TABLE [dbo].[PatientNotes] (
    [Id]                INT            NOT NULL,
    [PatientId]         INT            NOT NULL,
    [VisitId]           INT            NULL,
    [MedicalProviderId] INT            NOT NULL,
    [NotesDateTime]     DATETIME       NOT NULL,
    [NotesText]         NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_PatientNotes] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PatientNotes_Visit] FOREIGN KEY ([VisitId]) REFERENCES [dbo].[Visit] ([Id])
);

