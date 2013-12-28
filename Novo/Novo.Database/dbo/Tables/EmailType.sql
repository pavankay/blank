CREATE TABLE [dbo].[EmailType] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (MAX) NOT NULL,
    CONSTRAINT [PK_dbo_EmailType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

