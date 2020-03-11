'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var styles = {
    paper: {
        borderLeft: '1px solid #e0e0e0', // + Orange,
        width: 300,
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column'
    },
    header: {
        padding: 10,
        fontSize: 15,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center'
    },
    body: {
        flex: 1,
        overflowY: 'auto'
    },
    button: {
        fontSize: 20,
        marginLeft: 10,
        cursor: 'pointer',
        color: '#2196f3'
    },
    'delete': {
        color: "#ef5350"
    },
    close: {
        color: '#9e9e9e'
    },
    disabled: {
        color: '#9e9e9e',
        opacity: 0.3,
        cursor: 'default'
    }
};

function position(width, sourceSize, sourcePosition, scrollLeft) {
    var topOffset = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];

    var top = undefined,
        left = undefined;
    left = sourcePosition.x + (sourceSize.width - width) / 2 - scrollLeft;
    top = sourcePosition.y + sourceSize.height + 10 + topOffset;
    return { top: top, left: left, width: width };
}

var RightPanel = (function (_React$Component) {
    _inherits(RightPanel, _React$Component);

    function RightPanel() {
        _classCallCheck(this, RightPanel);

        _get(Object.getPrototypeOf(RightPanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(RightPanel, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var title = _props.title;
            var icon = _props.icon;
            var saveButtons = _props.saveButtons;
            var onRevert = _props.onRevert;
            var onRemove = _props.onRemove;
            var onSave = _props.onSave;
            var onDismiss = _props.onDismiss;
            var onTplSave = _props.onTplSave;
            var width = _props.width;
            var titleAdditional = _props.titleAdditional;
            var children = _props.children;

            var bStyles = styles.button;
            if (saveButtons && !onSave) {
                bStyles = _extends({}, bStyles, styles.disabled);
            }
            return _react2['default'].createElement(
                _materialUi.Paper,
                { rounded: false, zDepth: 0, style: _extends({}, styles.paper, { width: width }) },
                _react2['default'].createElement(
                    'div',
                    { style: styles.header },
                    icon && _react2['default'].createElement('span', { className: 'mdi mdi-' + icon, style: { marginRight: 4 } }),
                    _react2['default'].createElement(
                        'span',
                        { style: { flex: 1 } },
                        title
                    ),
                    titleAdditional,
                    saveButtons && _react2['default'].createElement('span', { className: 'mdi mdi-undo', onClick: onRevert, style: bStyles }),
                    saveButtons && _react2['default'].createElement('span', { className: 'mdi mdi-check', onClick: onSave, style: bStyles }),
                    onTplSave && _react2['default'].createElement('span', { className: 'mdi mdi-book-plus', onClick: onTplSave, style: _extends({}, styles.button) }),
                    onRemove && _react2['default'].createElement('span', { className: 'mdi mdi-delete', onClick: onRemove, style: _extends({}, styles.button, styles['delete']) }),
                    _react2['default'].createElement('span', { className: 'mdi mdi-close', onClick: function () {
                            onDismiss();
                        }, style: _extends({}, styles.button, styles.close) })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: styles.body },
                    children
                )
            );
        }
    }]);

    return RightPanel;
})(_react2['default'].Component);

var cssStyle = '\ntext[joint-selector="icon"] tspan, \ntext[joint-selector="type-icon"] tspan, \ntext[joint-selector="type-icon-outline"] tspan, \ntext[joint-selector="filter-icon"] tspan, \ntext[joint-selector="selector-icon"] tspan,\ntext[joint-selector="add-icon"] tspan,\ntext[joint-selector="swap-icon"] tspan,\ntext[joint-selector="split-icon"] tspan,\ntext[joint-selector="remove-icon"] tspan\n{\n    font: normal normal normal 24px/1 "Material Design Icons";\n    font-size: 24px;\n    text-rendering: auto;\n    -webkit-font-smoothing: antialiased;\n}\ntext[joint-selector="filter-icon"] tspan, \ntext[joint-selector="selector-icon"] tspan, \ntext[joint-selector="swap-icon"] tspan, \ntext[joint-selector="add-icon"] tspan, \ntext[joint-selector="split-icon"] tspan, \ntext[joint-selector="remove-icon"] tspan\n{\n    font-size: 18px;\n}\ntext[joint-selector="type-icon"] tspan, text[joint-selector="type-icon-outline"] tspan{\n    font-size: 14px;\n}\n.joint-tool circle {\n    fill: #ef534f;\n}\n.react-mui-context .pydio-form-panel{\n    padding-bottom: 0;\n}\n.react-mui-context .pydio-form-panel .form-legend{\n    display:none;\n}\n.react-mui-context .pydio-form-panel>.pydio-form-group{\n    margin: 12px;\n}\n.react-mui-context .pydio-form-panel .replicable-field .title-bar {\n    display: flex;\n    align-items: center;\n}\n.react-mui-context .pydio-form-panel .replicable-field .title-bar .legend{\n    display: none;\n}\n.react-mui-context .pydio-form-panel .replicable-field .replicable-group{\n    margin-bottom: 0;\n    padding-bottom: 0;\n}\n.right-panel-expand-button{\n    position: absolute;\n    bottom: 7px;\n    left: -9px;\n    cursor: pointer;\n    display: block;\n    background-color: #f5f5f5;\n    width: 20px;\n    height: 20px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 50%;\n    border: 1px solid #e0e0e0;\n    font-size: 18px;\n}\ng.marker-arrowhead-group-source{\n    display: none;\n}\npath.marker-arrowhead[end="target"] {\n    transform: scale(0.5) translateY(12px) translateX(-8px);\n    fill: #455A64;\n}\n.marker-vertices{\n    display: none;\n}\n';

var cssReadonlyStyle = '\npath.marker-arrowhead {\n    opacity: 0 !important;\n}\n.joint-element, .marker-arrowheads, [magnet=true]:not(.joint-element){\n    cursor: default;\n}\n';

function getCssStyle() {
    var editMode = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    return _react2['default'].createElement('style', { type: "text/css", dangerouslySetInnerHTML: { __html: cssStyle + (editMode ? '' : cssReadonlyStyle) } });
}

exports.styles = styles;
exports.position = position;
exports.RightPanel = RightPanel;
exports.getCssStyle = getCssStyle;
