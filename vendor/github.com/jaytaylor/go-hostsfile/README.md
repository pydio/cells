# Hostsfile

[![Documentation](https://godoc.org/github.com/jaytaylor/go-hostsfile?status.svg)](https://godoc.org/github.com/jaytaylor/go-hostsfile)
[![Build Status](https://travis-ci.org/jaytaylor/go-hostsfile.svg)](https://travis-ci.org/jaytaylor/go-hostsfile)
[![Report Card](https://goreportcard.com/badge/jaytaylor/go-hostsfile)](https://goreportcard.com/report/jaytaylor/go-hostsfile)

### The /etc/hosts parsing and resolver library for golang

Hostsfile is a go (golang) package for parsing hosts files and performing reverse IP -> hostname lookups which are file-based (e.g. via /etc/hosts).

This can be helpful to determine if there is a prettier (or known) hostname
available for an IP address.

These lookups are "extremely inexpensive" compared to normal IP reverse DNS
lookups because no network communication is required, as these lookups are all
file-based!  Naturally, the (obvious) tradeoff/downside is that this only
works in cases where the IP mapping exists in the hostsfile.

## Get it

    go get -u github.com/jaytaylor/go-hostsfile

## Usage

```go
package main

import (
    "fmt"

    "github.com/jaytaylor/go-hostsfile"
)

func main() {
    res, err := hostsfile.ReverseLookup("127.0.0.1")
    if err != nil {
        panic(err)
    }
    fmt.Printf("%v maps 127.0.0.1 to the following names: %v", hostsfile.HostsPath, res)
}
```

Output:

    /etc/hosts maps 127.0.0.1 to the following names: [localhost]

## Supported Operating Systems

Tested and verified working on:

* Linux
* Mac OS X
* Windows

It *should* also support Plan9, though admittedly I don't have a plan9
installation available to verify that one ;)

## Unit-tests

Running the unit-tests is straightforward and standard:

    go test


## License

Permissive MIT license.

## Contact

You are more than welcome to open issues and send pull requests if you find a bug or want a new feature.

If you appreciate this library please feel free to drop me a line and tell me!
It's always nice to hear from people who have benefitted from my work.

Email: jay at (my github username).com

Twitter: @jtaylor

