'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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
            var onSave = _props.onSave;
            var onDismiss = _props.onDismiss;
            var width = _props.width;
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
                    saveButtons && _react2['default'].createElement('span', { className: 'mdi mdi-undo', onClick: onRevert, style: bStyles }),
                    saveButtons && _react2['default'].createElement('span', { className: 'mdi mdi-content-save', onClick: onSave, style: bStyles }),
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

exports.styles = styles;
exports.position = position;
exports.RightPanel = RightPanel;
