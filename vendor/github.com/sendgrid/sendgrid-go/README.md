![SendGrid Logo](https://uiux.s3.amazonaws.com/2016-logos/email-logo%402x.png)

[![BuildStatus](https://travis-ci.org/sendgrid/sendgrid-go.svg?branch=master)](https://travis-ci.org/sendgrid/sendgrid-go)
[![Email Notifications Badge](https://dx.sendgrid.com/badge/go)](https://dx.sendgrid.com/newsletter/go)
[![Go Report Card](https://goreportcard.com/badge/github.com/sendgrid/sendgrid-go)](https://goreportcard.com/report/github.com/sendgrid/sendgrid-go)
[![GoDoc](https://godoc.org/github.com/sendgrid/sendgrid-go?status.svg)](https://godoc.org/github.com/sendgrid/sendgrid-go) 
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.txt)
[![Twitter Follow](https://img.shields.io/twitter/follow/sendgrid.svg?style=social&label=Follow)](https://twitter.com/sendgrid)
[![GitHub contributors](https://img.shields.io/github/contributors/sendgrid/sendgrid-go.svg)](https://github.com/sendgrid/sendgrid-go/graphs/contributors)

**NEW:** Subscribe to email [notifications](https://dx.sendgrid.com/newsletter/go) for releases and breaking changes.

**This library allows you to quickly and easily use the SendGrid Web API v3 via Go.**

Version 3.X.X of this library provides full support for all SendGrid [Web API v3](https://sendgrid.com/docs/API_Reference/Web_API_v3/index.html) endpoints, including the new [v3 /mail/send](https://sendgrid.com/blog/introducing-v3mailsend-sendgrids-new-mail-endpoint).

This library represents the beginning of a new path for SendGrid. We want this library to be community driven and SendGrid led. We need your help to realize this goal. To help make sure we are building the right things in the right order, we ask that you create [issues](https://github.com/sendgrid/sendgrid-go/issues) and [pull requests](https://github.com/sendgrid/sendgrid-go/blob/master/CONTRIBUTING.md) or simply upvote or comment on existing issues or pull requests.

Please browse the rest of this README for further detail.

We appreciate your continued support, thank you!

# Table of Contents

* [Installation](#installation)
* [Quick Start](#quick-start)
* [Processing Inbound Email](#inbound)
* [Usage](#usage)
* [Use Cases](#use-cases)
* [Announcements](#announcements)
* [Roadmap](#roadmap)
* [How to Contribute](#contribute)
* [Troubleshooting](#troubleshooting)
* [About](#about)
* [License](#license)

<a name="installation"></a>
# Installation

## Prerequisites

- Go version 1.6
- The SendGrid service, starting at the [free level](https://sendgrid.com/free?source=sendgrid-go)

## Setup Environment Variables

Update the development environment with your [SENDGRID_API_KEY](https://app.sendgrid.com/settings/api_keys), for example:

```bash
echo "export SENDGRID_API_KEY='YOUR_API_KEY'" > sendgrid.env
echo "sendgrid.env" >> .gitignore
source ./sendgrid.env
```

## Install Package

`go get github.com/sendgrid/sendgrid-go`

## Dependencies

- [rest](https://github.com/sendgrid/rest)

## Setup Environment Variables

### Initial Setup

```bash
cp .env_sample .env
```

### Environment Variable

Update the development environment with your [SENDGRID_API_KEY](https://app.sendgrid.com/settings/api_keys), for example:

```bash
echo "export SENDGRID_API_KEY='YOUR_API_KEY'" > sendgrid.env
echo "sendgrid.env" >> .gitignore
source ./sendgrid.env
```

<a name="quick-start"></a>
# Quick Start

## Hello Email

The following is the minimum needed code to send an email with the [/mail/send Helper](https://github.com/sendgrid/sendgrid-go/tree/master/helpers/mail) ([here](https://github.com/sendgrid/sendgrid-go/blob/master/examples/helpers/mail/example.go#L32) is a full example):

### With Mail Helper Class

```go
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func main() {
	from := mail.NewEmail("Example User", "test@example.com")
	subject := "Sending with SendGrid is Fun"
	to := mail.NewEmail("Example User", "test@example.com")
	plainTextContent := "and easy to do anywhere, even with Go"
	htmlContent := "<strong>and easy to do anywhere, even with Go</strong>"
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	client := sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))
	response, err := client.Send(message)
	if err != nil {
		log.Println(err)
	} else {
		fmt.Println(response.StatusCode)
		fmt.Println(response.Body)
		fmt.Println(response.Headers)
	}
}
```

The `NewEmail` constructor creates a [personalization object](https://sendgrid.com/docs/Classroom/Send/v3_Mail_Send/personalizations.html) for you. [Here](https://github.com/sendgrid/sendgrid-go/blob/master/examples/helpers/mail/example.go#L28) is an example of how to add to it.

### Without Mail Helper Class

The following is the minimum needed code to send an email without the /mail/send Helper ([here](https://github.com/sendgrid/sendgrid-go/blob/master/examples/mail/mail.go#L47) is a full example):

```go
package main

import (
	"fmt"
	"github.com/sendgrid/sendgrid-go"
	"log"
	"os"
)

func main() {
	request := sendgrid.GetRequest(os.Getenv("SENDGRID_API_KEY"), "/v3/mail/send", "https://api.sendgrid.com")
	request.Method = "POST"
	request.Body = []byte(` {
	"personalizations": [
		{
			"to": [
				{
					"email": "test@example.com"
				}
			],
			"subject": "Sending with SendGrid is Fun"
		}
	],
	"from": {
		"email": "test@example.com"
	},
	"content": [
		{
			"type": "text/plain",
			"value": "and easy to do anywhere, even with Go"
		}
	]
}`)
	response, err := sendgrid.API(request)
	if err != nil {
		log.Println(err)
	} else {
		fmt.Println(response.StatusCode)
		fmt.Println(response.Body)
		fmt.Println(response.Headers)
	}
}
```

## General v3 Web API Usage

```go
package main

import (
	"fmt"
	"github.com/sendgrid/sendgrid-go"
	"log"
	"os"
)

func main() {
	request := sendgrid.GetRequest(os.Getenv("SENDGRID_API_KEY"), "/v3/api_keys", "https://api.sendgrid.com")
	request.Method = "GET"

	response, err := sendgrid.API(request)
	if err != nil {
		log.Println(err)
	} else {
		fmt.Println(response.StatusCode)
		fmt.Println(response.Body)
		fmt.Println(response.Headers)
	}
}
```


<a name="inbound"></a>
# Processing Inbound Email

Please see [our helper](https://github.com/sendgrid/sendgrid-go/tree/master/helpers/inbound) for utilizing our Inbound Parse webhook.

<a name="usage"></a>
# Usage

- [SendGrid Docs](https://sendgrid.com/docs/API_Reference/index.html)
- [Library Usage Docs](https://github.com/sendgrid/sendgrid-go/tree/master/USAGE.md)
- [Example Code](https://github.com/sendgrid/sendgrid-go/tree/master/examples)
- [How-to: Migration from v2 to v3](https://sendgrid.com/docs/Classroom/Send/v3_Mail_Send/how_to_migrate_from_v2_to_v3_mail_send.html)
- [v3 Web API Mail Send Helper](https://github.com/sendgrid/sendgrid-go/tree/master/helpers/mail/README.md)

<a name="use-cases"></a>
# Use Cases

[Examples of common API use cases](https://github.com/sendgrid/sendgrid-go/blob/master/USE_CASES.md), such as how to send an email with a transactional template.

<a name="announcements"></a>
# Announcements

Join an experienced and passionate team that focuses on making an impact. Opportunities abound to grow the product - and grow your career! Check out our [Software Engineer- Delivery role](http://grnh.se/mg6dr31)

Please see our announcement regarding [breaking changes](https://github.com/sendgrid/sendgrid-go/issues/81). Your support is appreciated!

All updates to this library are documented in our [CHANGELOG](https://github.com/sendgrid/sendgrid-go/blob/master/CHANGELOG.md) and [releases](https://github.com/sendgrid/sendgrid-go/releases). You may also subscribe to email [release notifications](https://dx.sendgrid.com/newsletter/go) for releases and breaking changes.

<a name="roadmap"></a>
# Roadmap

If you are interested in the future direction of this project, please take a look at our open [issues](https://github.com/sendgrid/sendgrid-go/issues) and [pull requests](https://github.com/sendgrid/sendgrid-go/pulls). We would love to hear your feedback.

<a name="contribute"></a>
# How to Contribute

We encourage contribution to our libraries (you might even score some nifty swag), please see our [CONTRIBUTING](https://github.com/sendgrid/sendgrid-go/blob/master/CONTRIBUTING.md) guide for details.

Quick links:

- [Feature Request](https://github.com/sendgrid/sendgrid-go/tree/master/CONTRIBUTING.md#feature-request)
- [Bug Reports](https://github.com/sendgrid/sendgrid-go/tree/master/CONTRIBUTING.md#submit-a-bug-report)
- [Sign the CLA to Create a Pull Request](https://github.com/sendgrid/sendgrid-go/tree/master/CONTRIBUTING.md#cla)
- [Improvements to the Codebase](https://github.com/sendgrid/sendgrid-go/tree/master/CONTRIBUTING.md#improvements-to-the-codebase)

<a name="troubleshooting"></a>
# Troubleshooting

Please see our [troubleshooting guide](https://github.com/sendgrid/sendgrid-go/blob/master/TROUBLESHOOTING.md) for common library issues.

<a name="about"></a>
# About

sendgrid-go is guided and supported by the SendGrid [Developer Experience Team](mailto:dx@sendgrid.com).

sendgrid-go is maintained and funded by SendGrid, Inc. The names and logos for sendgrid-go are trademarks of SendGrid, Inc.

# License
[The MIT License (MIT)](LICENSE.txt)
