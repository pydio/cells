# Pydio Cells

[Homepage](https://pydio.com/) | [GitHub-Repository](https://github.com/pydio/pydio-core) |
[Issue-Tracker](https://github.com/pydio/pydio-core/issues) 

![License Badge](https://img.shields.io/badge/License-AGPL%203%2B-blue.svg)
[![GoDoc](https://godoc.org/github.com/pydio/cells?status.svg)](https://godoc.org/github.com/pydio/cells)
[![Build Status](https://travis-ci.org/pydio/cells.svg?branch=master)](https://travis-ci.org/pydio/cells)
[![Go Report Card](https://goreportcard.com/badge/github.com/pydio/cells)](https://goreportcard.com/report/github.com/pydio/cells)


![Pydio Cells Logo](TODO: add an URL here)

Pydio Cells is the nextgen file sharing platform for organizations. It is a full rewrite of the Pydio project using the Go language following a micro-service architecture. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

The following elements are required to compile and run pydio on your machine

 - Go language v1.10 or higher (with a [correctly configured](https://golang.org/doc/install#testing) Go toolchain),
 - MySQL database 5.6 or higher (or MariaDB equivalent),
 - [Frontend] For running the PHP frontend, PHP-FPM is required as well (see pydio/cells-front repository).


_Note: We have developped and tested Pydio Cells on MacOS, Ubuntu, Debian and CentOS. Windows version might still have unknown glitches and is not yet supported._

### Installing

Assuming that your system meets the above prerequisites, building the **Pydio Cells** backend from the source code is quite straight forward:

```sh
# Retrieve the code
go get -u github.com/pydio/cells
# From this line on, we assume you are in Pydio Cells' code roots directory
cd $GOPATH/src/github.com/pydio/cells 
# Ensure all dependencies are present for the go package
./deps.sh
# Build your binary
make dev
```

To have the environment running, you must also:

- Create a database in your chosen DB server,
- Run the Pydio Cells installer that will guide you through the necessary steps: you might refer to the [wiki](https://github.com/pydio/cells/wiki) for additional information.

```bash
./cells install
```

## Running the tests

To run the tests, simply do
```sh
go test -v ./...
```

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Micro](https://github.com/micro/micro) - Micro-service framework
* [Minio](https://github.com/minio/minio) - Objects server implementing s3 protocol


## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/pydio/cells/tags). 

## Authors

* **Charles du Jeu** - *Initial work* - [cdujeu](https://github.com/cdujeu)

See also the list of [contributors](https://github.com/pydio/cells/graphs/contributors) who participated in this project.

## License

This project is licensed under the AGPLv3 License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc