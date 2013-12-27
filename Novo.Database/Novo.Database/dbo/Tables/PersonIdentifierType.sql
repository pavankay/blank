CREATE TABLE [dbo].[PersonIdentifierType] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_PersonIdentifierType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

