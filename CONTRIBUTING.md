# Contributing to Pydio Cells

*Pydio Cells is a free and open source project and we are very glad to welcome your contribution. To make the process as seamless as possible, we recommend you read this contribution guide*.

FYI, we use GitHub only for "qualified bugs" : bugs that are easily reproduced, validated by a Pydio Team member. Our preferred communication channel is our Forum. Please do not ask question in GitHub issues, nor in Twitter or other social feed.

So, what should I do in case of:

- **Install or upgrade issue?**  Search the [F.A.Q.](https://pydio.com/en/docs/faq) or [READ THE DOCS](https://pydio.com/en/docs)
- **No answer yet?** Search the [FORUM](https://forum.pydio.com)
- **Still stuck?** It's time to ask the community via the [FORUM](https://forum.pydio.com)

*And only if you're invited to*:

- **Post a GitHub issue**: make sure to put as much detail as possible (see below).
- or **submit a pull request**.

## Report an issue

If you report an issue (either on the forum or upon request by submitting a GitHub issue), make sure to put as much detail as possible:

- Hardware and OS info and versions
- Pydio Cells version
- Switch to debug mode by starting Pydio Cells with `$ ./cells --log debug start` and attach relevant log to your request
- Describe steps and provide files to help us reproduce the bug
- Attach any screenshot that might be relevant
- If you are referring to a discussion on the Forum, add the link.

_Remember: the more info you give, the more easily we can reproduce the bug, the quicker we can fix it._

## Code conventions

If you end up coding to contribute a fix or new feature, please read carefully the below rules before jumping to the next paragraph that describes the PR process step by step. We will reject any PR that does not respect these rules.

Generally speaking, we respect the standard code conventions defined in [effective Go](https://golang.org/doc/effective_go.html).

**In addition**:

- Use "goimports" to format the Go code.
- Always format code before committing / submitting a pull request.
- Organise your import in 3 blocks, separated by an empty line:
   1. Standard libray imports
   2. Other third party lib imports
   3. Pydio internal dependencies

### Logging

We use [zap](https://github.com/uber-go/zap) for logging purpose.
Logs are redirected to standard out in development mode and serialized as json and collected by a dedicated service when in production.

- Provide contextual information using zap objects, for instance :

```go
log.Logger(ctx).Debug("A summary message for action on node "+node.Path, zap.Any("<a predefined id>", node))...
```

- When adding a zap "object", always use one of the predefined ID that can be found in `cells/common/zapfields.go`, so that logs are then more easily searchable
- Always use the context when available to retrieve the correct logger, rather than creating a new context:

```go
log.Logger(ctx).Debug ...
// rather than
log.Logger(context.Background()).Debug...
```

- Error should always use the Error level: `log.Logger(ctx).Error(...)`
- In Go, it is idiomatic to start error message with a lower case.
  For instance rather use `log.Logger(ctx).Error("unable to save file")`
  than `log.Logger(ctx).Error("Unable to save file")`

### Comments

- Public methods and structures are commented following golang basic comment style. Please remember to end your sentences with punctuation.
- Add at least a comment/documentation for each package. If a package contains more than one file, put the package comment in:
  - `plugins.go`: in case of a `grpc` or `rest` package
  - `dao.go`: where we define this package interfaces
  - a specific `doc.go` file if the correct file is not obvious

### Tests

- Every file must provide tests in separated file with suffix "_test.go" in the same folder.
- We use the **GoConvey** library.

_Note that PRs that do not provide relevant passing tests will be rejected._

## Pull Request Workflow

Before submitting a Pull Request, please sign the [Contributor License Agreement](https://pydio.com/en/community/contribute/contributor-license-agreement-cla), then start by forking the Pydio Cells GitHub repository, make changes in a branch and then send a pull request. Below are the steps in details:

### Setup your Pydio Cells Github Repository

Fork the [Pydio Cells](https://github.com/pydio/cells/fork) source repository to your own personal repository. Copy the URL of your fork.

```sh
mkdir -p $GOPATH/src/github.com/pydio
cd $GOPATH/src/github.com/pydio
git clone <the URL you just copied>
cd cells
```

### Set up git remote as ``upstream``

```sh
cd $GOPATH/src/github.com/pydio/cells
git remote add upstream https://github.com/pydio/cells
git fetch upstream
git merge upstream/master
```

### Create your feature branch

Before making code changes, make sure you create a separate branch for these changes:

```sh
git checkout -b my-new-feature
```

If you're using Go 1.16 or later, don't forget to [set the environment variable `GO111MODULE` to `auto`](README.md#note-on-the-third-party-libraries) before attempting your first compilation!

### Test Pydio Cells changes

After your code changes, make sure

- To add test cases for the new code. If you have questions about how to do it, please ask on our [Forum](https://forum.pydio.com).
- To squash your commits into a single commit. `git rebase -i`. It's okay to force update your pull request.
- To run `go test -race ./...` and `go build` completes.

### Commit changes

After verification, commit your changes. This is a [great post](https://chris.beams.io/posts/git-commit/) on how to write useful commit messages.

```sh
git commit -am 'Add a cool feature'
```

### Push to the branch

Push your locally committed changes to the remote origin (your fork)

```sh
git push origin my-new-feature
```

### Create a Pull Request

Pull Requests can be created via GitHub. Refer to [this document](https://help.github.com/articles/creating-a-pull-request/) for detailed steps on how to create a pull request. After a Pull Request gets peer reviewed and approved, it will be merged.

## Attribution

The Pull Request How-To is adapted from minio's great [Contributing Page][minioContributing].

[minioContributing]: https://github.com/minio/minio/blob/master/CONTRIBUTING.md
