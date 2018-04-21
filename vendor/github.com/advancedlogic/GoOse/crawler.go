package goose

import (
	"io/ioutil"
	"log"
	"net/http"
	"net/http/cookiejar"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

// Crawler can fetch the target HTML page
type Crawler struct {
	config  Configuration
	url     string
	RawHTML string
	Charset string
}

// NewCrawler returns a crawler object initialised with the URL and the [optional] raw HTML body
func NewCrawler(config Configuration, url string, RawHTML string) Crawler {
	return Crawler{
		config:  config,
		url:     url,
		RawHTML: RawHTML,
		Charset: "",
	}
}

func getCharsetFromContentType(cs string) string {
	cs = strings.ToLower(strings.Replace(cs, " ", "", -1))
	if strings.HasPrefix(cs, "text/html;charset=") {
		cs = strings.TrimPrefix(cs, "text/html;charset=")
	}
	if strings.HasPrefix(cs, "application/xhtml+xml;charset=") {
		cs = strings.TrimPrefix(cs, "application/xhtml+xml;charset=")
	}
	return NormaliseCharset(cs)
}

// SetCharset can be used to force a charset (e.g. when read from the HTTP headers)
// rather than relying on the detection from the HTML meta tags
func (c *Crawler) SetCharset(cs string) {
	c.Charset = getCharsetFromContentType(cs)
}

// GetContentType returns the Content-Type string extracted from the meta tags
func (c Crawler) GetContentType(document *goquery.Document) string {
	var attr string
	// <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	document.Find("meta[http-equiv#=(?i)^Content\\-type$]").Each(func(i int, s *goquery.Selection) {
		attr, _ = s.Attr("content")
	})
	return attr
}

// GetCharset returns a normalised charset string extracted from the meta tags
func (c Crawler) GetCharset(document *goquery.Document) string {
	// manually-provided charset (from HTTP headers?) takes priority
	if "" != c.Charset {
		return c.Charset
	}

	// <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	ct := c.GetContentType(document)
	if "" != ct && strings.Contains(strings.ToLower(ct), "charset") {
		return getCharsetFromContentType(ct)
	}

	// <meta charset="utf-8">
	selection := document.Find("meta").EachWithBreak(func(i int, s *goquery.Selection) bool {
		_, exists := s.Attr("charset")
		return !exists
	})

	if selection != nil {
		cs, _ := selection.Attr("charset")
		return NormaliseCharset(cs)
	}

	return ""
}

// Preprocess fetches the HTML page if needed, converts it to UTF-8 and applies
// some text normalisation to guarantee better results when extracting the content
func (c *Crawler) Preprocess() (*goquery.Document, error) {
	if c.RawHTML == "" {
		c.RawHTML = c.fetchHTML(c.url, c.config.timeout)
	}
	if c.RawHTML == "" {
		return nil, nil
	}

	c.RawHTML = c.addSpacesBetweenTags(c.RawHTML)

	reader := strings.NewReader(c.RawHTML)
	document, err := goquery.NewDocumentFromReader(reader)

	if err != nil {
		return nil, err
	}

	cs := c.GetCharset(document)
	//log.Println("-------------------------------------------CHARSET:", cs)
	if "" != cs && "UTF-8" != cs {
		// the net/html parser and goquery require UTF-8 data
		c.RawHTML = UTF8encode(c.RawHTML, cs)
		reader = strings.NewReader(c.RawHTML)
		document, err = goquery.NewDocumentFromReader(reader)

		if nil != err {
			return nil, err
		}
	}

	return document, nil
}

// Crawl fetches the HTML body and returns an Article
func (c Crawler) Crawl() (*Article, error) {
	article := new(Article)

	document, err := c.Preprocess()
	if nil != err {
		return nil, err
	}
	if nil == document {
		return article, nil
	}

	extractor := NewExtractor(c.config)

	startTime := time.Now().UnixNano()

	article.RawHTML, err = document.Html()
	if nil != err {
		return nil, err
	}
	article.FinalURL = c.url
	article.Doc = document

	article.Title = extractor.GetTitle(document)
	article.MetaLang = extractor.GetMetaLanguage(document)
	article.MetaFavicon = extractor.GetFavicon(document)

	article.MetaDescription = extractor.GetMetaContentWithSelector(document, "meta[name#=(?i)^description$]")
	article.MetaKeywords = extractor.GetMetaContentWithSelector(document, "meta[name#=(?i)^keywords$]")
	article.CanonicalLink = extractor.GetCanonicalLink(document)
	if "" == article.CanonicalLink {
		article.CanonicalLink = article.FinalURL
	}
	article.Domain = extractor.GetDomain(article.CanonicalLink)
	article.Tags = extractor.GetTags(document)

	cleaner := NewCleaner(c.config)
	article.Doc = cleaner.Clean(article.Doc)

	article.TopImage = OpenGraphResolver(document)
	if article.TopImage == "" {
		article.TopImage = WebPageResolver(article)
	}

	article.TopNode = extractor.CalculateBestNode(document)
	if article.TopNode != nil {
		article.TopNode = extractor.PostCleanup(article.TopNode)

		article.CleanedText, article.Links = extractor.GetCleanTextAndLinks(article.TopNode, article.MetaLang)

		videoExtractor := NewVideoExtractor()
		article.Movies = videoExtractor.GetVideos(document)
	}

	article.Delta = time.Now().UnixNano() - startTime

	return article, nil
}

// In many cases, like at the end of each <li> element or between </span><span> tags,
// we need to add spaces, otherwise the text on either side will get joined together into one word.
// This method also adds newlines after each </p> tag to preserve paragraphs.
func (c Crawler) addSpacesBetweenTags(text string) string {
	text = strings.Replace(text, "><", "> <", -1)
	text = strings.Replace(text, "</blockquote>", "</blockquote>\n", -1)
	text = strings.Replace(text, "<img ", "\n<img ", -1)
	text = strings.Replace(text, "</li>", "</li>\n", -1)
	return strings.Replace(text, "</p>", "</p>\n", -1)
}

func (c *Crawler) fetchHTML(u string, timeout time.Duration) string {
	cookieJar, _ := cookiejar.New(nil)
	client := &http.Client{
		Jar:     cookieJar,
		Timeout: timeout,
	}
	req, err := http.NewRequest("GET", u, nil)
	if err != nil {
		log.Println(err.Error())
		return ""
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.91 Safari/534.30")
	resp, err := client.Do(req)
	if err != nil {
		log.Println(err.Error())
		return ""
	}
	contents, err := ioutil.ReadAll(resp.Body)
	if err == nil {
		c.RawHTML = string(contents)
	} else {
		log.Println(err.Error())
	}
	err = resp.Body.Close()
	if err != nil {
		log.Println(err.Error())
	}

	return c.RawHTML
}
