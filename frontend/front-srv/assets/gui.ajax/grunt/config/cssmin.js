module.exports = {
    options: {
        shorthandCompacting: false,
        roundingPrecision: -1
    },
    target: {
        files: {
            'res/build/pydio.material.min.css': ['res/themes/common/css/mui/pydio-mui.css','res/themes/material/css/pydio.css']
        }
    }
};