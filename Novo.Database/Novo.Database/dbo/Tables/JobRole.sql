CREATE TABLE [dbo].[JobRole] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_JobRole] PRIMARY KEY CLUSTERED ([Id] ASC)
);

