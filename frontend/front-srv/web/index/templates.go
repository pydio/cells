package index

import (
	"html/template"

	"github.com/pydio/cells/v4/common/utils/i18n"
)

// TplConfFilterFunc takes a TplConf and modifies it
type TplConfFilterFunc func(in *TplConf) *TplConf

var (
	tplConfFilters []TplConfFilterFunc
)

// RegisterTplConfFilter registers a filter for modifying main Template Conf
func RegisterTplConfFilter(f TplConfFilterFunc) {
	tplConfFilters = append(tplConfFilters, f)
}

// FilterTplConf applies registered filters on TplConf object
func FilterTplConf(i *TplConf) *TplConf {
	for _, f := range tplConfFilters {
		i = f(i)
	}
	return i
}

// TplConf is a data struct for main index page template
type TplConf struct {
	ApplicationTitle string
	Favicon          string
	Rebase           string
	ResourcesFolder  string
	Theme            string
	Version          string
	ErrorMessage     string
	LoadingString    string
	CustomHTMLHeader template.HTML
	StartParameters  map[string]interface{}
}

// GetLoadingString sends an i18n string for "Loading..."
func GetLoadingString(lang string) string {
	if s, o := i18n.LoadingStrings[lang]; o {
		return s
	} else {
		return i18n.LoadingStrings["en-us"]
	}
}

var Loader = `
<div style="position: absolute;display:flex; flex-direction:column ;top: 0;bottom: 0;left: 0;right: 0;align-items: center;justify-content: center; font-family: Roboto, sans-serif;background-color:#424242; color: white">
	<svg width="60px" height="79px" viewBox="0 0 213 279" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<defs></defs>
		<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
			<g id="PydioCells" fill-rule="nonzero">
				<path d="M182.497694,0 C165.654445,0 152,13.6567508 152,30.5023057 C152,34.2652328 152.717077,37.8506199 153.959858,41.1800726 L171.593967,23.5459631 C176.525892,18.6140384 184.522112,18.6140384 189.454037,23.5459631 C194.385962,28.4801935 194.385962,36.474108 189.454037,41.4060327 L171.819927,59.0424478 C175.147074,60.2898397 178.737073,61 182.497694,61 C199.340943,61 213,47.3478606 213,30.5046114 C213,13.6613623 199.340943,0 182.497694,0" id="Shape" fill="#FFF"></path>
				<path d="M105,256.992999 C105,269.142357 95.1483132,279 83.0046679,279 C70.8516868,279 61,269.142357 61,256.992999 C61,244.848308 70.8516868,235 83.0046679,235 C95.1483132,235 105,244.848308 105,256.992999" id="Shape" fill="#FFF"></path>
				<path d="M36.4037352,124.837197 C38.8312768,103.925465 55.296141,86.8384278 76.0097793,83.8116077 C83.195579,82.7562796 90.1300947,83.3686018 96.4882711,85.3029834 C102.814172,87.2234486 109.66339,85.6601714 114.331739,80.9633816 L132,63.1874818 C115.804863,51.2077686 95.1511637,44.9848121 73.042784,47.5848621 C34.9144742,52.0729057 4.43073026,83.1691332 0.460904425,121.587714 C-4.25355193,167.182526 27.7701709,206.433772 70.3501263,213 L70.3501263,187.781138 C70.3501263,181.219549 66.7353255,175.226213 60.9765422,172.129811 C44.6430834,163.369428 34.0384383,145.189952 36.4037352,124.837197" id="Shape" fill="#FFF"></path>
				<path d="M132.926329,98.8058932 C128.286688,103.436169 126.564855,110.237611 128.4961,116.495681 C129.859605,120.884458 130.590221,125.551887 130.590221,130.384185 C130.590221,148.517495 120.310415,164.277615 105.25834,172.193667 C99.504162,175.217046 96,181.263805 96,187.756408 L96,213 C136.151275,206.853391 167,172.144903 167,130.384185 C167,111.921136 160.959625,94.846706 150.761257,81 L132.926329,98.8058932 Z" id="Shape" fill="#FFF"></path>
				<path d="M92.4826685,139.48423 C90.0056507,141.961039 86.7516657,143.201763 83.5046386,143.201763 C80.2529729,143.201763 76.9989879,141.963358 74.5173315,139.48423 C69.556338,134.523655 69.556338,126.480983 74.5173315,121.518089 L91.7706418,104.268553 C89.1521464,103.445269 86.3852155,103 83.5046386,103 C68.3108712,103 56,115.312152 56,130.497681 C56,145.690167 68.3131905,158 83.5046386,158 C98.6891288,158 111,145.687848 111,130.497681 C111,127.612709 110.557013,124.841373 109.73134,122.232375 L92.4826685,139.48423 Z" id="Shape" fill="#FFF"></path>
			</g>
		</g>
	</svg>
	<div style="font-size:12px; margin-top: 10px;">{{.LoadingString}}</div>
</div>
`

var loading = `<!DOCTYPE html>
<html xmlns:ajxp>
	<head>
		<title>{{.ApplicationTitle}}</title>
{{if .CustomHTMLHeader}}{{.CustomHTMLHeader}}{{end}}
		{{if .Rebase}}<base href="{{.Rebase}}"/>{{end}}
		<link rel="stylesheet" type="text/css" href="{{.ResourcesFolder}}/dist/pydio.{{.Theme}}.min.css?v={{.Version}}">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
	</head>
	<body style="position: absolute;display:flex;top: 0;bottom: 0;left: 0;right: 0;align-items: center;justify-content: center; background-color:#424242;" class="react-mui-context">
		<script type="text/javascript">
			window.setTimeout(function(){window.location.reload();}, 4000);
		</script>
		<div style="color: white">Please wait while {{.ApplicationTitle}} server is starting...</div>
	</body>
</html>
`

var Page = `<!DOCTYPE html>
<html xmlns:ajxp>
	<head>
		<title>{{.ApplicationTitle}}</title>
{{if .CustomHTMLHeader}}{{.CustomHTMLHeader}}{{end}}
		{{if .Rebase}}<base href="{{.Rebase}}"/>{{end}}
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/dist/pydio.boot.min.js?v={{.Version}}"></script>
		<link rel="icon" type="image/x-png" href="{{.Favicon}}">
	</head>
	<body style="overflow: hidden;background-color: #424242;" class="react-mui-context">
		<script type="text/javascript">
			var pydio, startParameters = {}, MessageHash={};
			startParameters = {{.StartParameters}};
			window.pydioBootstrap = new PydioBootstrap(startParameters);
		</script>
		<div id="{{.StartParameters.MAIN_ELEMENT}}">` + Loader + `</div>
	</body>
</html>
`

var Public = `<!DOCTYPE html>
<html xmlns:ajxp>
	<head>
		<title>{{.ApplicationTitle}}</title>
{{if .CustomHTMLHeader}}{{.CustomHTMLHeader}}{{end}}
		{{if .Rebase}}<base href="{{.Rebase}}"/>{{end}}
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
		<link rel="stylesheet" type="text/css" href="{{.ResourcesFolder}}/dist/pydio.{{.Theme}}.min.css?v={{.Version}}">
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/dist/pydio.boot.min.js?v={{.Version}}"></script>
		<link rel="icon" type="image/x-png" href="{{.Favicon}}">
	</head>
	<body style="overflow: hidden;background-color: #424242;" class="react-mui-context">
		<script type="text/javascript">
			var pydio, startParameters = {}, MessageHash={};
			startParameters = {{.StartParameters}};
			window.pydioBootstrap = new PydioBootstrap(startParameters);
		</script>
		<div class="vertical_fit vertical_layout" id="{{.StartParameters.MAIN_ELEMENT}}">` + Loader + `</div>
	</body>
</html>
`

var errorTpl = `<!DOCTYPE html>
<html xmlns:ajxp>
	<head>
		<title>{{.ApplicationTitle}}</title>
{{if .CustomHTMLHeader}}{{.CustomHTMLHeader}}{{end}}
		{{if .Rebase}}<base href="{{.Rebase}}"/>{{end}}
		<link rel="stylesheet" type="text/css" href="{{.ResourcesFolder}}/dist/pydio.{{.Theme}}.min.css?v={{.Version}}">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
		<link rel="icon" type="image/x-png" href="{{.Favicon}}">
	</head>
	<body style="position: absolute;display:flex;top: 0;bottom: 0;left: 0;right: 0;align-items: center;justify-content: center;" class="react-mui-context">
		<div>{{.ErrorMessage}}</div>
	</body>
</html>
`
