[![Build Status](https://travis-ci.org/dsoprea/go-exif.svg?branch=master)](https://travis-ci.org/dsoprea/go-exif)
[![Coverage Status](https://coveralls.io/repos/github/dsoprea/go-exif/badge.svg?branch=master)](https://coveralls.io/github/dsoprea/go-exif?branch=master)
[![GoDoc](https://godoc.org/github.com/dsoprea/go-exif?status.svg)](https://godoc.org/github.com/dsoprea/go-exif)

# Overview

This package provides native Go functionality to parse an existing EXIF block, update an existing EXIF block, or add a new EXIF block.


# *NOTICE*

**This project is modulized and v2 is now available (in v2/). This features a heavily reflowed interface that makes usage much simpler.** The undefined-type tag-processing (which affects most photographic images) has also been overhauled and streamlined. It is now complete and stable. Adoption is strongly encouraged.


# Getting

To get the project and dependencies:

```
$ go get -t github.com/dsoprea/go-exif/v2
```


# Scope

This project is concerned only with parsing and encoding raw EXIF data. It does not understand specific file-formats. This package assumes you know how to extract the raw EXIF data from a file, such as a JPEG, and, if you want to update it, know how to write it back. File-specific formats are not the concern of *go-exif*, though we provide [exif.SearchAndExtractExif](https://godoc.org/github.com/dsoprea/go-exif/v2#SearchAndExtractExif) and [exif.SearchFileAndExtractExif](https://godoc.org/github.com/dsoprea/go-exif/v2#SearchFileAndExtractExif) as brute-force search mechanisms that will help you explore the EXIF information for newer formats that you might not yet have any way to parse.

That said, the author also provides [go-jpeg-image-structure](https://github.com/dsoprea/go-jpeg-image-structure) and [go-png-image-structure](https://github.com/dsoprea/go-png-image-structure) to support properly reading and writing JPEG and PNG images. See the [SetExif example in go-jpeg-image-structure](https://godoc.org/github.com/dsoprea/go-jpeg-image-structure#example-SegmentList-SetExif) for practical information on getting started with JPEG files.


# Usage

The package provides a set of [working examples](https://godoc.org/github.com/dsoprea/go-exif/v2#pkg-examples) and is covered by unit-tests. Please look to these for getting familiar with how to read and write EXIF.

Create an instance of the `Exif` type and call `Scan()` with a byte-slice, where the first byte is the beginning of the raw EXIF data. You may pass a callback that will be invoked for every tag or `nil` if you do not want one. If no callback is given, you are effectively just validating the structure or parsing of the image.

Obviously, it is most efficient to properly parse the media file and then provide the specific EXIF data to be parsed, but there is also a heuristic for finding the EXIF data within the media blob, directly. This means that, at least for testing or curiosity, **you do not have to parse or even understand the format of image or audio file in order to find and decode the EXIF information inside of it.** See the usage of the `SearchAndExtractExif` method in the example.

The library often refers to an IFD with an "IFD path" (e.g. IFD/Exif, IFD/GPSInfo). A "fully-qualified" IFD-path is one that includes an index describing which specific sibling IFD is being referred to if not the first one (e.g. IFD1, the IFD where the thumbnail is expressed per the TIFF standard).

There is an "IFD mapping" and a "tag index" that must be created and passed to the library from the top. These contain all of the knowledge of the IFD hierarchies and their tag-IDs (the IFD mapping) and the tags that they are allowed to host (the tag index). There are convenience functions to load them with the standard TIFF information, but you, alternatively, may choose something totally different (to support parsing any kind of EXIF data that does not follow or is not relevant to TIFF at all).


# Reader Tool

There is a runnable reading/dumping tool included:

```
$ go get github.com/dsoprea/go-exif/v2/exif-read-tool
$ exif-read-tool -filepath "<media file-path>"
```

Example output:

```
IFD-PATH=[IFD] ID=(0x010f) NAME=[Make] COUNT=(6) TYPE=[ASCII] VALUE=[Canon]
IFD-PATH=[IFD] ID=(0x0110) NAME=[Model] COUNT=(22) TYPE=[ASCII] VALUE=[Canon EOS 5D Mark III]
IFD-PATH=[IFD] ID=(0x0112) NAME=[Orientation] COUNT=(1) TYPE=[SHORT] VALUE=[1]
IFD-PATH=[IFD] ID=(0x011a) NAME=[XResolution] COUNT=(1) TYPE=[RATIONAL] VALUE=[72/1]
IFD-PATH=[IFD] ID=(0x011b) NAME=[YResolution] COUNT=(1) TYPE=[RATIONAL] VALUE=[72/1]
IFD-PATH=[IFD] ID=(0x0128) NAME=[ResolutionUnit] COUNT=(1) TYPE=[SHORT] VALUE=[2]
IFD-PATH=[IFD] ID=(0x0132) NAME=[DateTime] COUNT=(20) TYPE=[ASCII] VALUE=[2017:12:02 08:18:50]
...
```

You can also print the raw, parsed data as JSON:

```
$ exif-read-tool -filepath "<media file-path>" -json
```

Example output:

```
[
    {
        "ifd_path": "IFD",
        "fq_ifd_path": "IFD",
        "ifd_index": 0,
        "tag_id": 271,
        "tag_name": "Make",
        "tag_type_id": 2,
        "tag_type_name": "ASCII",
        "unit_count": 6,
        "value": "Canon",
        "value_string": "Canon"
    },
    {
        "ifd_path": "IFD",
...
```


# Testing

The traditional method:

```
$ go test github.com/dsoprea/go-exif/v2/...
```


# *Contributing*

EXIF has an excellently-documented structure but there are a lot of devices and manufacturers out there. There are only so many files that we can personally find to test against, and most of these are images that have been generated only in the past few years. JPEG, being the largest implementor of EXIF, has been around for even longer (but not much). Therefore, there is a lot of compatibility to test for.

**If you are able to help by running the included reader-tool against all of the EXIF-compatible files you have, it would be deeply appreciated. This is mostly going to be JPEG files (but not all variations). If you are able to test a large number of files (thousands or millions), please post an issue mentioning how many files you tried, whether there were any failures, and, if you would be willing, give us access to the failed files.**

If you are able to test 100K+ files, I will give you credit on the project. The further back in time your images reach, the higher in the list your name/company will go.


# Contributors/Testing

Thank you to the following users for solving non-trivial issues, supporting the project with solving edge-case problems in specific images, or otherwise providing their non-trivial time or image corpus to test go-exif:

- [philip-firstorder](https://github.com/philip-firstorder) (200K images)
