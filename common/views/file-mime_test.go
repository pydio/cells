package views

import (
	"fmt"
	"io/ioutil"
	"os"
	"sync"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func Test_NewTeeMimeReader(t *testing.T) {
	Convey("Test file smaller than limit", t, func() {
		f, e := os.Open("./testdata/mimes/pdf-sample.pdf")
		So(e, ShouldBeNil)
		defer f.Close()
		mr := NewTeeMimeReader(f, func(res *MimeResult) {
			fmt.Println("Got MimeResult", res)
		})
		bb, er := ioutil.ReadAll(mr)
		So(er, ShouldBeNil)
		So(len(bb), ShouldBeGreaterThan, 0)
		fmt.Printf("Read %d bytes from file", len(bb))
	})
	Convey("Test file bigger than limit", t, func() {
		f, e := os.Open("./testdata/mimes/pdf-sample2.pdf")
		So(e, ShouldBeNil)
		defer f.Close()
		mr := NewTeeMimeReader(f, func(res *MimeResult) {
			fmt.Println("Got MimeResult", res)
		})
		bb, er := ioutil.ReadAll(mr)
		So(er, ShouldBeNil)
		So(len(bb), ShouldBeGreaterThan, 0)
		fmt.Printf("Read %d bytes from file", len(bb))
	})
	Convey("Test file exact limit size", t, func() {
		f, e := os.Open("./testdata/mimes/pdf-sample.pdf")
		So(e, ShouldBeNil)
		defer f.Close()
		mr := NewTeeMimeReader(f, func(res *MimeResult) {
			fmt.Println("Got MimeResult", res)
		})
		mr.SetLimit(3028)
		bb, er := ioutil.ReadAll(mr)
		So(er, ShouldBeNil)
		So(len(bb), ShouldBeGreaterThan, 0)
		fmt.Printf("Read %d bytes from file", len(bb))
	})
	Convey("Test file with waiter", t, func() {
		f, e := os.Open("./testdata/mimes/pdf-sample.pdf")
		So(e, ShouldBeNil)
		defer f.Close()
		mr := NewTeeMimeReader(f, nil)
		waiter := mr.Wait()
		wg := &sync.WaitGroup{}
		wg.Add(1)
		var res *MimeResult
		go func() {
			defer wg.Done()
			res = <-waiter
		}()
		bb, er := ioutil.ReadAll(mr)
		So(er, ShouldBeNil)
		So(len(bb), ShouldBeGreaterThan, 0)
		wg.Wait()
		fmt.Printf("Read %d bytes from file, %d in buffer, after Wait signal, mime is %s", len(bb), len(mr.data), res.GetMime())
		So(len(mr.data), ShouldBeGreaterThan, 0)
		So(res.GetMime(), ShouldStartWith, "application/pdf")
	})
	Convey("Test file 2 with waiter", t, func() {
		f, e := os.Open("./testdata/mimes/pdf-sample2.pdf")
		So(e, ShouldBeNil)
		defer f.Close()
		mr := NewTeeMimeReader(f, nil)
		waiter := mr.Wait()
		wg := &sync.WaitGroup{}
		wg.Add(1)
		var res *MimeResult
		go func() {
			defer wg.Done()
			res = <-waiter
		}()
		bb, er := ioutil.ReadAll(mr)
		So(er, ShouldBeNil)
		So(len(bb), ShouldBeGreaterThan, 0)
		wg.Wait()
		fmt.Printf("Read %d bytes from file, %d in buffer, after Wait signal, mime is %s", len(bb), len(mr.data), res.GetMime())
		So(len(mr.data), ShouldEqual, mimeReadLimit)
	})
	Convey("Test file with wrong extension", t, func() {
		f, e := os.Open("./testdata/mimes/pdf-fake-ext.jpg")
		So(e, ShouldBeNil)
		defer f.Close()
		mr := NewTeeMimeReader(f, nil)
		waiter := mr.Wait()
		wg := &sync.WaitGroup{}
		wg.Add(1)
		var res *MimeResult
		go func() {
			defer wg.Done()
			res = <-waiter
		}()
		bb, er := ioutil.ReadAll(mr)
		So(er, ShouldBeNil)
		So(len(bb), ShouldBeGreaterThan, 0)
		wg.Wait()
		fmt.Printf("Read %d bytes from file, %d in buffer, after Wait signal, mime is %s", len(bb), len(mr.data), res.GetMime())
		So(len(mr.data), ShouldBeGreaterThan, 0)
		So(res.GetMime(), ShouldStartWith, "application/pdf")
	})
	Convey("Test file docx", t, func() {
		f, e := os.Open("./testdata/mimes/docx-sample_1MB.docx")
		So(e, ShouldBeNil)
		defer f.Close()
		mr := NewTeeMimeReader(f, nil)
		waiter := mr.Wait()
		wg := &sync.WaitGroup{}
		wg.Add(1)
		var res *MimeResult
		go func() {
			defer wg.Done()
			res = <-waiter
		}()
		bb, er := ioutil.ReadAll(mr)
		So(er, ShouldBeNil)
		So(len(bb), ShouldBeGreaterThan, 0)
		wg.Wait()
		fmt.Printf("Read %d bytes from file, %d in buffer, after Wait signal, mime is %s", len(bb), len(mr.data), res.GetMime())
		So(res.GetMime(), ShouldEqual, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	})

}
