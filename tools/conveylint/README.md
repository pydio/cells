# GoConvey analyzer proof of concept

This analyzer reports Go test functions that do not call `Convey` from
`github.com/smartystreets/goconvey/convey`. It recognizes named and dot imports
using Go type information, not function names alone.

```sh
go test ./tools/conveylint/rule
go build -o /tmp/cells-conveylint ./tools/conveylint
go vet -vettool=/tmp/cells-conveylint ./path/to/package
```

This is a proof of concept, not a CI gate. It reports existing tests too. Before
using it in CI, add and verify baseline filtering that distinguishes newly added
test functions from existing ones. Filtering diagnostics by changed lines alone
can miss a new test when its declaration is not on a changed line or report an
existing test when its declaration is edited. The analyzer only checks for a
call; it cannot prove that the call runs or that assertions are meaningful.
