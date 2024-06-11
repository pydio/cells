# Pydio LOG

Pydio relies on [zap](https://github.com/uber-go/zap) logging framework.

We mainly use 2 loggers that are defined in this package and used throughout the backend:

- A syslog logger: it should be used to log technical information.
- An audit logger: it only logs some very precise information at strategic places and is used to monitor the Application from a business point of view. Audit logs are among others used for GRDP compliance.

WARNING: you should not modify nor remove any of the audit log.

## Guidelines

- When enriching the log with zap fields, always use constants from `common/zapfields.go` as keys, otherwise the logs won't be usable for analysis
- Pydio provides some shortcuts to easily generate zap fields for commons pydio objects. Typically when loging info about a tree.Node, one should write: `...Debug("A message", node.Zap())`
- Depending on the level of details required, one can either use `Zap()` that serializes all accessible information or `ZapPath()`, `ZapUuid()` or `ZapId()` (depending on the relevant info) that simply calls zap.String() with relevant pydio zap id (as seen in common/zapfields.go) and corresponding value.

## Conventions

- it is idiomatic in Go to write error message that start with a lower case letter and do not end with a punctuation mark.
