<img src="https://github.com/pydio/cells/wiki/images/PydioCellsColor.png" width="400" />

[Homepage](https://pydio.com/) | [Dev Guide](https://pydio.com/en/docs/developer-guide) | [GitHub-Repository](https://github.com/pydio/cells) |
[Issue-Tracker](https://github.com/pydio/cells/issues)

[![License Badge](https://img.shields.io/badge/License-AGPL%203%2B-blue.svg)](LICENSE)
[![GoDoc](https://godoc.org/github.com/pydio/cells?status.svg)](https://godoc.org/github.com/pydio/cells)
[![Build Status](https://travis-ci.org/pydio/cells.svg?branch=master)](https://travis-ci.org/pydio/cells)
[![Go Report Card](https://goreportcard.com/badge/github.com/pydio/cells?rand=3)](https://goreportcard.com/report/github.com/pydio/cells)


Pydio Cells 是组织的下一代文件共享平台。它是 Pydio 项目的完整重写，使用 Go 语言，遵循微服务架构。



<p align="center"> 
  <img src="https://github.com/pydio/cells-dist/raw/master/resources/v1.4.0/homepage.png" width="600" style="border: 3px solid #e0e0e0; border-radius: 5px;"/>
</p>

## Getting Started

这些说明将为您提供项目的副本，并在您的本地机器上运行，用于**开发**和测试目的。请参阅下面的[部署部分](#Deployment)，了解如何在实时系统上部署项目。

### Prerequisites

以下元素是在您的机器上编译和运行 pydio 所必需的

- Go v1.12 或者更高, with a [correctly configured](https://golang.org/doc/install#testing) Go toolchain,
- MySQL database 5.6 或更高 (或者 MariaDB)。The new mysql 8 authentication method is supported starting at Cells 1.4.1.

_注意：我们已经在 MacOS, Ubuntu, Debian 和 CentOS 上开发和测试了 Pydio Cells。Windows 版本可能仍然有未知的故障，目前还不支持。_

### Installing

假设你的系统满足上述先决条件，从源代码构建 **Pydio Cells** 后端是相当直接的：

```sh
# Retrieve the code
go get -u github.com/pydio/cells
# From this line on, we assume you are in Pydio Cells' code roots directory
cd $GOPATH/src/github.com/pydio/cells
# Build your binary
make dev
```

为了让环境运行，你必须：

- 在选定的 DB 服务器中创建数据库
- 运行 Pydio Cells 安装程序，它将指导您完成必要的步骤：更多信息，请参考 [official documentation](https://pydio.com/en/docs/cells/v2/cells-installation)。

```sh
./cells install
```

#### Note on the third party libraries

我们目前仍然通过 [vendor 机制](https://github.com/kardianos/govendor)来管理第三方依赖：简单地说，我们为每个依赖获取并维护特定版本的源文件，将它们复制到' vendor/ '子文件夹中。二进制文件是用这些代码构建的。

当你克隆 `github.com/pydio/cells` 存储库时，你还会有一个所有资源的嵌入式本地副本供您研究。然而，您不应该尝试直接修改已经被 _vendor_ 的代码。

还请注意，在将它们作为依赖项集成之前，我们必须 fork 一些库，最重要的是 dex 和 minio。如果您需要修改这部分代码，请与我们联系。

## Running the tests

运行测试，只需简单的运行下面的命令：

```sh
go test -v ./...
```

如果你想添加更多测试或贡献代码，请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 文档。


## Deployment

目前为[Linux、MacOSX和Windows发行版](https://pydio.com/en/download)提供了二进制文件。要在实时系统上部署它们，请参见[安装指南](https://pydio.com/en/docs/cells/v2/cells-installation)说明。


## Built With

Pydio Cells 使用许多开源的 golang 库。下面列出了最重要的库，请参阅[DEPENDENCIES](DEPENDENCIES)获得其他库及其许可的详尽列表。



- [Micro](https://github.com/micro/micro) - Micro-service framework
- [Minio](https://github.com/minio/minio) - Objects server implementing s3 protocol

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us. You can find a comprehensive [Developer Guide](https://pydio.com/en/docs/developer-guide) on our website. Our online docs are open source as well, feel free to improve them by contributing!

We are also looking for help to translate the Cells interface in various languages.  
It is really easy to participate: just navigate to [our page in the Crowdin translation tool](https://crowdin.com/project/pydio-cells), create an account and get started.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/pydio/cells/tags).

## Authors

See the list of [contributors](https://github.com/pydio/cells/graphs/contributors) who participated in this project. Pydio Cells is also a continuation of the Pydio project and many contributions were ported from [pydio-core](https://github.com/pydio/pydio-core) to the code that can be found under `frontend/front-srv/assets`.

## License

This project is licensed under the AGPLv3 License - see the [LICENSE](LICENSE) file for more details.
