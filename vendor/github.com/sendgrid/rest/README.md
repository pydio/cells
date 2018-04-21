![SendGrid Logo](https://uiux.s3.amazonaws.com/2016-logos/email-logo%402x.png)

[![Build Status](https://travis-ci.org/sendgrid/rest.svg?branch=master)](https://travis-ci.org/sendgrid/rest)
[![GoDoc](https://godoc.org/github.com/sendgrid/rest?status.png)](http://godoc.org/github.com/sendgrid/rest)
[![Go Report Card](https://goreportcard.com/badge/github.com/sendgrid/rest)](https://goreportcard.com/report/github.com/sendgrid/rest)
[![Email Notifications Badge](https://dx.sendgrid.com/badge/go)](https://dx.sendgrid.com/newsletter/go)
[![Twitter Follow](https://img.shields.io/twitter/follow/sendgrid.svg?style=social&label=Follow)](https://twitter.com/sendgrid)
[![GitHub contributors](https://img.shields.io/github/contributors/sendgrid/rest.svg)](https://github.com/sendgrid/rest/graphs/contributors)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.txt)

**Quickly and easily access any RESTful or RESTful-like API.**

If you are looking for the SendGrid API client library, please see [this repo](https://github.com/sendgrid/sendgrid-go).

# Announcements

All updates to this library is documented in our [CHANGELOG](https://github.com/sendgrid/rest/blob/master/CHANGELOG.md).

# Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [How to Contribute](#contribute)
- [About](#about)
- [License](#license)

<a name="installation"></a>
# Installation

## Prerequisites

- Go version 1.6

## Install Package

```bash
go get github.com/sendgrid/rest
```

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

`GET /your/api/{param}/call`

```go
package main

import "github.com/sendgrid/rest"
import "fmt"

func main() {
	const host = "https://api.example.com"
	param := "myparam"
	endpoint := "/your/api/" + param + "/call"
	baseURL := host + endpoint
	method := rest.Get
	request := rest.Request{
		Method:  method,
		BaseURL: baseURL,
	}
	response, err := rest.Send(request)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(response.StatusCode)
		fmt.Println(response.Body)
		fmt.Println(response.Headers)
	}
}
```

`POST /your/api/{param}/call` with headers, query parameters and a request body.

```go
package main

import "github.com/sendgrid/rest"
import "fmt"

func main() {
	const host = "https://api.example.com"
	param := "myparam"
	endpoint := "/your/api/" + param + "/call"
	baseURL := host + endpoint
	Headers := make(map[string]string)
	key := os.Getenv("API_KEY")
	Headers["Authorization"] = "Bearer " + key
	Headers["X-Test"] = "Test"
	var Body = []byte(`{"some": 0, "awesome": 1, "data": 3}`)
	queryParams := make(map[string]string)
	queryParams["hello"] = "0"
	queryParams["world"] = "1"
	method := rest.Post
	request = rest.Request{
		Method:      method,
		BaseURL:     baseURL,
		Headers:     Headers,
		QueryParams: queryParams,
		Body:        Body,
	}
	response, err := rest.Send(request)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(response.StatusCode)
		fmt.Println(response.Body)
		fmt.Println(response.Headers)
	}
}
```

<a name="usage"></a>
# Usage

- [Usage Examples](USAGE.md)

<a name="roadmap"></a>
# Roadmap

If you are interested in the future direction of this project, please take a look at our [milestones](https://github.com/sendgrid/rest/milestones). We would love to hear your feedback.

<a name="contribute"></a>
# How to Contribute

We encourage contribution to our projects, please see our [CONTRIBUTING](https://github.com/sendgrid/rest/blob/master/CONTRIBUTING.md) guide for details.

Quick links:

- [Feature Request](https://github.com/sendgrid/rest/blob/master/CONTRIBUTING.md#feature-request)
- [Bug Reports](https://github.com/sendgrid/rest/blob/master/CONTRIBUTING.md#submit-a-bug-report)
- [Sign the CLA to Create a Pull Request](https://github.com/sendgrid/rest/blob/master/CONTRIBUTING.md#cla)
- [Improvements to the Codebase](https://github.com/sendgrid/rest/blob/master/CONTRIBUTING.md#improvements-to-the-codebase)

<a name="about"></a>
# About

rest is guided and supported by the SendGrid [Developer Experience Team](mailto:dx@sendgrid.com).

rest is maintained and funded by SendGrid, Inc. The names and logos for rest are trademarks of SendGrid, Inc.

<a name="license"></a>
# License
[The MIT License (MIT)](LICENSE.txt)
