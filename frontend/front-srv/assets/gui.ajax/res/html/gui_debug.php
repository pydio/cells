<!DOCTYPE html>
<html xmlns:ajxp>
<head>
    <title>PYDIO_APPLICATION_TITLE</title>
    <?php if(isSet($START_PARAMETERS) && isSet($START_PARAMETERS["REBASE"])){
        echo '<base href="'.$START_PARAMETERS["REBASE"].'"/>';
    }?>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel="stylesheet" type="text/css" href="plugins/gui.ajax/res/build/pydio.<?php print($crtTheme);?>.min.css">
    <script language="javascript" type="text/javascript" src="plugins/gui.ajax/res/js/vendor/es6/browser-polyfill.js"></script>
    <script language="javascript" type="text/javascript" src="plugins/gui.ajax/res/js/vendor/modernizr/modernizr.min.js"></script>
    <script language="javascript" type="text/javascript" src="plugins/gui.ajax/res/build/boot.prod.js"></script>
    <script language="javascript" type="text/javascript" src="plugins/gui.ajax/res/build/PydioCore.js"></script>
    <link rel="icon" type="image/x-png" href="index.php?get_action=serve_favicon">
</head>
<body style="overflow: hidden;" class="react-mui-context">
<script type="text/javascript">
    // Initialize booter.
    var pydio, startParameters = {}, MessageHash={};
    <?php if(isSet($JSON_START_PARAMETERS)) print "startParameters = ".$JSON_START_PARAMETERS.";"; ?>
    window.pydioBootstrap = new PydioBootstrap(startParameters);

</script>
<div id="ajxp_desktop"></div>
</body>
</html>