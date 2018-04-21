### Go fastcgi client with fcgi params support

[![Build Status](https://travis-ci.org/tomasen/fcgi_client.svg?branch=master)](https://travis-ci.org/tomasen/fcgi_client)
[![GoDoc](https://godoc.org/github.com/tomasen/fcgi_client?status.svg)](http://godoc.org/github.com/tomasen/fcgi_client)


###  Examples

simple get request

```go
    func main() {
        reqParams := "name=value"

        env := make(map[string]string)
        env["SCRIPT_FILENAME"] = "/home/www/test.php"
        env["SERVER_SOFTWARE"] = "go / fcgiclient "
        env["REMOTE_ADDR"] = "127.0.0.1"
        env["QUERY_STRING"] = reqParams

        fcgi, err := fcgiclient.Dial("unix", "/tmp/php-fpm.sock")
        if err != nil {
                log.Println("err:", err)
        }

        resp, err := fcgi.Get(env)
        if err != nil {
                log.Println("err:", err)
        }

        content, err = ioutil.ReadAll(resp.Body)
        if err != nil {
                log.Println("err:", err)
        }
        log.Println("content:", string(content))
    }
```

or post form data

```go
    func main() {

        env := make(map[string]string)
        env["SCRIPT_FILENAME"] = "/home/www/test.php"

        fcgi, err := fcgiclient.Dial("unix", "/tmp/php-fpm.sock")
        if err != nil {
                log.Println("err:", err)
        }

        resp, err := fcgi.PostForm(env, url.Values{"foo": {"bar"}})
        if err != nil {
                log.Println("err:", err)
        }

        content, err = ioutil.ReadAll(resp.Body)
        if err != nil {
                log.Println("err:", err)
        }
        log.Println("content:", string(content))
    }
```

or send file

```go
    func main() {

        env := make(map[string]string)
        env["SCRIPT_FILENAME"] = "/home/www/test.php"

        fcgi, err := fcgiclient.Dial("unix", "/tmp/php-fpm.sock")
        if err != nil {
                log.Println("err:", err)
        }

        resp, err := fcgi.PostFile(env, url.Values{"foo": {"bar"}}, map[string]string{"file1":"/path/to/file1"})
        if err != nil {
                log.Println("err:", err)
        }

        content, err = ioutil.ReadAll(resp.Body)
        if err != nil {
                log.Println("err:", err)
        }
        log.Println("content:", string(content))
    }
```

More examples can be found in [fcgiclient_test.go](https://github.com/tomasen/fcgi_client/src/tip/fcgiclient_test.go)


###  Functions

#### func Dial
    func Dial(network, address string) (fcgi *FCGIClient, err error)
Connects to the fcgi responder at the specified network address. See func [net.Dial](http://golang.org/pkg/net/#Dial) for a description of the network and address parameters.

#### func DialTimeout
    func DialTimeout(network, address string, timeout time.Duration) (fcgi *FCGIClient, err error)
Connects to the fcgi responder at the specified network address with timeout. See func [net.DialTimeout](http://golang.org/pkg/net/#DialTimeout) for a description of the network, address and timeout parameters.


#### func (*FCGIClient) Get
    func (this *FCGIClient) Get(p map[string]string) (resp *http.Response, err error)
Get issues a GET request to the fcgi responder.

#### func (*FCGIClient) Post
    func (this *FCGIClient) Post(p map[string]string, bodyType string,
                                 body io.Reader, l int) (resp *http.Response, err error)
Get issues a Post request to the fcgi responder. with request body in the format that bodyType specified

#### func (*FCGIClient) PostFile
    func (this *FCGIClient) PostFile(p map[string]string, data url.Values,
                                     file map[string]string) (resp *http.Response, err error)
PostFile issues a POST to the fcgi responder in multipart(RFC 2046) standard, with form as a string key to a list values (url.Values), and/or with file as a string key to a list file path.

#### func (*FCGIClient) PostForm
    func (this *FCGIClient) PostForm(p map[string]string,
                                     data url.Values) (resp *http.Response, err error)
PostForm issues a POST to the fcgi responder, with form as a string key to a list values (url.Values)

#### func (*FCGIClient) Request
    func (this *FCGIClient) Do(p map[string]string, req io.Reader) (r io.Reader, err error)
Request returns a HTTP Response with Header and Body from fcgi responder

#### func (*FCGIClient) Do
    func (this *FCGIClient) Request(p map[string]string,
                                         req io.Reader) (resp *http.Response, err error)
Do made the request and returns a io.Reader that translates the data read from fcgi responder out of fcgi packet before returning it.

#### func (*FCGIClient) Close
    func (this *FCGIClient) Close()
Close fcgi connnection

