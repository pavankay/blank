CREATE TABLE [dbo].[PatientRelativeProblem] (
    [Id]             INT IDENTITY (1, 1) NOT NULL,
    [PatientId]      INT NOT NULL,
    [ProblemId]      INT NOT NULL,
    [RelationTypeId] INT NOT NULL,
    CONSTRAINT [PK_PatientRelativeProblemHistory] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PatientRelativeProblemHistory_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id]),
    CONSTRAINT [FK_PatientRelativeProblemHistory_Problem] FOREIGN KEY ([ProblemId]) REFERENCES [dbo].[Problem] ([Id]),
    CONSTRAINT [FK_PatientRelativeProblemHistory_RelationType] FOREIGN KEY ([RelationTypeId]) REFERENCES [dbo].[RelationType] ([Id])
);

