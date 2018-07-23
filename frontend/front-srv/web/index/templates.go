package index

var loading = `<!DOCTYPE html>
<html xmlns:ajxp>
	<head>
		<title>{{.ApplicationTitle}}</title>
		{{if .Rebase}}<base href="{{.Rebase}}"/>{{end}}
		<link rel="stylesheet" type="text/css" href="{{.ResourcesFolder}}/build/pydio.{{.Theme}}.min.css?v={{.Version}}">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
	</head>
	<body style="position: absolute;display:flex;top: 0;bottom: 0;left: 0;right: 0;align-items: center;justify-content: center;" class="react-mui-context">
		<script type="text/javascript">
			window.setTimeout(function(){window.location.reload();}, 4000);
		</script>
		<div>Please wait while {{.ApplicationTitle}} server is starting...</div>
	</body>
</html>
`

var page = `<!DOCTYPE html>
<html xmlns:ajxp>
	<head>
		<title>{{.ApplicationTitle}}</title>
		{{if .Rebase}}<base href="{{.Rebase}}"/>{{end}}
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
		<link rel="stylesheet" type="text/css" href="{{.ResourcesFolder}}/build/pydio.{{.Theme}}.min.css?v={{.Version}}">
{{if .Debug}}
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/js/vendor/es6/browser-polyfill.js"></script>
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/js/vendor/modernizr/modernizr.min.js"></script>
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/build/boot.prod.js"></script>
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/build/PydioCore.js"></script>
{{else}}
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/build/pydio.boot.min.js?v={{.Version}}"></script>
{{end}}
		<link rel="icon" type="image/x-png" href="{{.ResourcesFolder}}/themes/common/images/favicon.png">
	</head>
	<body style="overflow: hidden;" class="react-mui-context">
		<script type="text/javascript">
			var pydio, startParameters = {}, MessageHash={};
			startParameters = {{.StartParameters}};
			window.pydioBootstrap = new PydioBootstrap(startParameters);
		</script>
		<div id="{{.StartParameters.MAIN_ELEMENT}}"></div>
	</body>
</html>
`

var public = `<!DOCTYPE html>
<html xmlns:ajxp>
	<head>
		<title>{{.ApplicationTitle}}</title>
		{{if .Rebase}}<base href="{{.Rebase}}"/>{{end}}
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
		<link rel="stylesheet" type="text/css" href="{{.ResourcesFolder}}/build/pydio.{{.Theme}}.min.css?v={{.Version}}">
		<link rel="stylesheet" href="plug/action.share/res/minisite.css"/>
{{if .Debug}}
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/js/vendor/es6/browser-polyfill.js"></script>
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/js/vendor/modernizr/modernizr.min.js"></script>
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/build/boot.prod.js"></script>
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/build/PydioCore.js"></script>
{{else}}
		<script language="javascript" type="text/javascript" src="{{.ResourcesFolder}}/build/pydio.boot.min.js?v={{.Version}}"></script>
{{end}}
		<link rel="icon" type="image/x-png" href="{{.ResourcesFolder}}/themes/common/images/favicon.png">
	</head>
	<body style="overflow: hidden;" class="react-mui-context">
		<script type="text/javascript">
			var pydio, startParameters = {}, MessageHash={};
			startParameters = {{.StartParameters}};
			window.pydioBootstrap = new PydioBootstrap(startParameters);
		</script>
		<div class="vertical_fit vertical_layout" id="{{.StartParameters.MAIN_ELEMENT}}">
			<div style="position: absolute;display:flex;top: 0;bottom: 0;left: 0;right: 0;align-items: center;justify-content: center;">Loading link...</div>
		</div>
	</body>
</html>
`

var errorTpl = `<!DOCTYPE html>
<html xmlns:ajxp>
	<head>
		<title>{{.ApplicationTitle}}</title>
		{{if .Rebase}}<base href="{{.Rebase}}"/>{{end}}
		<link rel="stylesheet" type="text/css" href="{{.ResourcesFolder}}/build/pydio.{{.Theme}}.min.css?v={{.Version}}">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
		<link rel="icon" type="image/x-png" href="{{.ResourcesFolder}}/themes/common/images/favicon.png">
	</head>
	<body style="position: absolute;display:flex;top: 0;bottom: 0;left: 0;right: 0;align-items: center;justify-content: center;" class="react-mui-context">
		<div>{{.ErrorMessage}}</div>
	</body>
</html>
`
