-- +migrate Up
CREATE TABLE IF NOT EXISTS %%PREFIX%%_tree (
    uuid  VARCHAR(128)      NOT NULL,
    level SMALLINT          NOT NULL,

    `name` VARCHAR(255)      NOT NULL,
    leaf     TINYINT(1),
    mtime    INT             NOT NULL,
    etag     VARCHAR(255),
    size     BIGINT,
    mode     VARCHAR(10),

    mpath1 VARCHAR(255)      NOT NULL,
    mpath2 VARCHAR(255)      NOT NULL,
    mpath3 VARCHAR(255)      NOT NULL,
    mpath4 VARCHAR(255)      NOT NULL,

    CONSTRAINT tree_pk PRIMARY KEY (uuid),
    CONSTRAINT tree_u1 UNIQUE (mpath1, mpath2, mpath3, mpath4)
);

CREATE INDEX %%PREFIX%%_tree_name_idx ON %%PREFIX%%_tree(`name`);
CREATE INDEX %%PREFIX%%_tree_mpath1_idx ON %%PREFIX%%_tree(mpath1);
CREATE INDEX %%PREFIX%%_tree_mpath2_idx ON %%PREFIX%%_tree(mpath2);
CREATE INDEX %%PREFIX%%_tree_mpath3_idx ON %%PREFIX%%_tree(mpath3);
CREATE INDEX %%PREFIX%%_tree_mpath4_idx ON %%PREFIX%%_tree(mpath4);

CREATE TABLE IF NOT EXISTS %%PREFIX%%_commits (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid     VARCHAR(128) NOT NULL,
    etag     VARCHAR(255) NOT NULL,
    mtime    INTEGER NOT NULL,
    size     INTEGER,
    data     BLOB NULL
);
