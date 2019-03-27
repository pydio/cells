module.exports = {
    sheets: {
        options: {
            plugins: [
                new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions", "> 10%"]})
            ]
        },
        files: {
            "res/themes/material/css/pydio.css": "res/themes/material/css/pydio.less",
            "res/themes/common/css/mui/pydio-mui.css": "res/themes/common/css/mui/pydio-mui.less",
        }
    }
};