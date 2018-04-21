# Log [![License](https://img.shields.io/:license-apache-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![GoDoc](https://godoc.org/github.com/micro/go-log?status.svg)](https://godoc.org/github.com/micro/go-log)

This is the global logger for all micro based libraries which makes use of [github.com/go-log/log](https://github.com/go-log/log). 

It defaults the logger to the stdlib log implementation. 

## Set Logger

Set the logger for micro libraries

```go
// import micro/go-log
import "github.com/micro/go-log"

// SetLogger expects github.com/go-log/log.Logger interface
log.SetLogger(mylogger)
```
