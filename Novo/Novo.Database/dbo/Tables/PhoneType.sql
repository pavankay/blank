CREATE TABLE [dbo].[PhoneType] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (MAX) NOT NULL,
    CONSTRAINT [PK_dbo_PhoneType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

