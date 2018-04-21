-- +migrate Up
CREATE TABLE IF NOT EXISTS %%PREFIX%%_tree (
    uuid  VARCHAR(128)      NOT NULL,
    level SMALLINT          NOT NULL,

    hash   BIGINT            NOT NULL,
    mpath1 VARCHAR(255)      NOT NULL,
    mpath2 VARCHAR(255)      NOT NULL,
    mpath3 VARCHAR(255)      NOT NULL,
    mpath4 VARCHAR(255)      NOT NULL,
    rat    BLOB              NOT NULL,

    CONSTRAINT tree_pk PRIMARY KEY (uuid),
    CONSTRAINT tree_u1 UNIQUE (hash)
);

CREATE INDEX %%PREFIX%%_tree_mpath1_idx ON %%PREFIX%%_tree(mpath1);
CREATE INDEX %%PREFIX%%_tree_mpath2_idx ON %%PREFIX%%_tree(mpath2);
CREATE INDEX %%PREFIX%%_tree_mpath3_idx ON %%PREFIX%%_tree(mpath3);
CREATE INDEX %%PREFIX%%_tree_mpath4_idx ON %%PREFIX%%_tree(mpath4);

CREATE TABLE IF NOT EXISTS %%PREFIX%%_nodes (
    uuid     VARCHAR(128) NOT NULL,
    name     VARCHAR(255) NOT NULL,
    leaf     TINYINT(1),
    mtime    INT NOT NULL,
    etag     VARCHAR(255),
    size     BIGINT,
    mode     VARCHAR(10),

    CONSTRAINT node_pk PRIMARY KEY (uuid)
);

CREATE TABLE IF NOT EXISTS %%PREFIX%%_commits (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid     VARCHAR(128) NOT NULL,
    etag     VARCHAR(255) NOT NULL,
    mtime    INTEGER NOT NULL,
    size     INTEGER,
    data     BLOB NULL
);
