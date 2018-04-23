# Contributing to Pydio Cells

*Pydio Cells is a free and open source project and we are very glad to welcome your contribution. To make the process as seamless as possible, we recommend you read this contribution guide.* 

FYI, we use Github only for "qualified bugs" : bugs that are easily reproduced, validated by a Pydio Team member. Our preferred communication channel is our Forum. Please do not ask question in github issues, nor in Twitter or other social feed.

So, what should I do in case of: 

- **Install or upgrade issue?**  Search the [F.A.Q](https://pydio.com/en/docs/faq)  or [READ THE DOCS](https://pydio.com/en/docs)  
- **No answer yet?** Search the [FORUM](https://forum.pydio.com)
- **Still stuck?** It's time to ask the community via the [FORUM](https://forum.pydio.com)

*And only if you're invited to*

- **Post a github issue**: make sure to put as much detail as possible (see below).
- or **submit a pull request**.

## Report an issue

If you report an issue (either on the forum or upon request by submitting a github issue), make sure to put as much detail as possible:

- Hardware and OS info and versions
- Pydio Cells version
- Switch to debug mode by starting Pydio Cells with `$ ./cells --log debug start` and attach relevant log to your request
- Describe steps and provide files to help us reproduce the bug
- Attach any screenshot that might be relevant 
- If you are referring to a discussion on the Forum, add the link. 

_Remember: the more info you give, the more easily we can reproduce the bug, the quicker we can fix it._

## Code conventions

If you end up coding to contribute a fix or new feature, please read carefully the below rules before jumping to the 
next paragraph that describes the PR process step by step. We will reject any PR that does not respect these rules.

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

```
log.Logger(ctx).Debug("A summary message for action on node "+node.Path, zap.Any("<a predefined id>", node))...
```

- When adding a zap "object", always use one of the predefined ID that can be found in `cells/common/zapfields.go`, so that logs are then more easily searchable
- Always use the context when available to retrieve the correct logger, rather than creating a new context:

```
log.Logger(ctx).Debug ...
// rather than
log.Logger(context.Background()).Debug...
```
- Error should always use the Error level: `log.Logger(ctx).Error(...)`
- In Go, it is idiomatic to start error message with a lower case.  
  For instance rather use `log.Logger(ctx).Error("unable to save file")`  
  than `log.Logger(ctx).Error("Unable to save file")`

### Comments

- Public methods and structures are commented following golang basic comment style.
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
Fork [Pydio Cells](https://github.com/pydio/cells/fork) source repository to your own personal repository. Copy the URL of your fork.

```sh
mkdir -p $GOPATH/src/github.com/pydio
cd $GOPATH/src/github.com/pydio
git clone <the URL you just copied>
cd pydio
```

### Set up git remote as ``upstream``
```sh
cd $GOPATH/src/github.com/pydio/cells
git remote add upstream https://github.com/pydio/cells
git fetch upstream
git merge upstream/master
```

### Create your feature branch
Before making code changes, make sure you create a separate branch for these changes

```
git checkout -b my-new-feature
```

### Test Pydio Cells changes
After your code changes, make sure

- To add test cases for the new code. If you have questions about how to do it, please ask on our [Forum](https://forum.pydio.com).
- To squash your commits into a single commit. `git rebase -i`. It's okay to force update your pull request.
- To run `go test -race ./...` and `go build` completes.

### Commit changes
After verification, commit your changes. This is a [great post](https://chris.beams.io/posts/git-commit/) on how to write useful commit messages

```
$ git commit -am 'Add a cool feature'
```

### Push to the branch
Push your locally committed changes to the remote origin (your fork)
```
$ git push origin my-new-feature
```

### Create a Pull Request
Pull requests can be created via GitHub. Refer to [this document](https://help.github.com/articles/creating-a-pull-request/) for detailed steps on how to create a pull request. After a Pull Request gets peer reviewed and approved, it will be merged.

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
education, socio-economic status, nationality, personal appearance, race,
religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

* The use of sexualized language or imagery and unwelcome sexual attention or
  advances
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or electronic
  address, without explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [https://www.contributor-covenant.org/version/1/4][currVersion]

The Pull Request HowTo is adapted from minio's great [Contributing Page][minioContributing].

[homepage]: https://www.contributor-covenant.org
[currVersion]: https://www.contributor-covenant.org/version/1/4/code-of-conduct.html
[minioContributing]: https://github.com/minio/minio/blob/master/CONTRIBUTING.md
