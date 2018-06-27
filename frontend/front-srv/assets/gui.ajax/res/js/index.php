<?php die(); ?>
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <!-- 1. Load platform support before any code that touches the DOM. -->
    <script src="vendor/jquery/jquery-1.11.2.min.js"></script>
    <script src="vendor/es6/browser-polyfill.js"></script>
    <script src="vendor/xpath-polyfill/javascript-xpath-cmp.js"></script>

    <!--<script type="text/javascript" language="javascript" src="../jquery_backbone-min.js"></script>-->
    <?php
        $files = glob("core/*/*.js");
        foreach($files as $jsFile){
            echo '<script type="text/javascript" language="javascript" src="'.$jsFile.'"></script>';
        }
        echo '<script type="text/javascript" language="javascript" src="core/Pydio.js"></script>';
    ?>
    <!--
    <script language="JavaScript">
        jQuery.noConflict();
    </script>
    <script type="text/javascript" language="javascript" src="../lib/prototype/prototype.js"></script>
    -->
</head>
<body>

<ul id="children"></ul>

<script>

    var parameters = new Map();
    parameters.set("serverAccessPath", "http://localhost/index.php");
    <?php if(isSet($_GET["token"])) {?>
    parameters.set("SECURE_TOKEN", "<?php echo $_GET["token"]?>");
    <?php } ?>
    parameters.set("usersEnabled", true);
    parameters.set("currentLanguage", 'fr');
    parameters.set("APPLICATION_ROOT", "/plugins/gui.ajax/res/js/core");
    pydio = new Pydio(parameters);

    pydio.getContextHolder().observe("context_changed", function(){
        var ctx = pydio.getContextHolder().getContextNode();
        var ul = document.getElementById('children');
        Array.from(ul.childNodes).forEach(function(cN){
            ul.removeChild(cN);
        });
        if(ctx.getParent()){
            var el = document.createElement('li');
            el.innerHTML = '.. Parent Directory';
            el.onclick = function(){
                pydio.getContextHolder().requireContextChange(ctx.getParent());
            };
            ul.appendChild(el);
        }
        ctx.getChildren().forEach(function(c){
            var el = document.createElement('li');
            el.innerHTML = c.getPath();
            el.onclick = function(){
                pydio.getContextHolder().requireContextChange(c);
            };
            ul.appendChild(el);
        });
    });

    pydio.init();

</script>

</body>
</html>