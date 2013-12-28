CREATE TABLE [dbo].[MaritialStatus] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_MaritialStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);

