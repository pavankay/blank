CREATE TABLE [dbo].[PatientProblem] (
    [Id]        INT IDENTITY (1, 1) NOT NULL,
    [PatientId] INT NOT NULL,
    [ProblemId] INT NOT NULL,
    CONSTRAINT [PK_PatientProblem] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PatientProblem_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id]),
    CONSTRAINT [FK_PatientProblem_Problem] FOREIGN KEY ([ProblemId]) REFERENCES [dbo].[Problem] ([Id])
);

