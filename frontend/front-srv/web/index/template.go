package index

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
		<link rel="icon" type="image/x-png" href="index.php?get_action=serve_favicon">
	</head>
	<body style="overflow: hidden;" class="react-mui-context">
		<script type="text/javascript">
			var pydio, startParameters = {}, MessageHash={};
			startParameters = {{.StartParameters}};
			window.pydioBootstrap = new PydioBootstrap(startParameters);
		</script>
		<div id="ajxp_desktop"></div>
	</body>
</html>
`
