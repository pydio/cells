'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var Paper = _require2.Paper;
var FlatButton = _require2.FlatButton;

var _require3 = require('react-chartjs');

var Doughnut = _require3.Doughnut;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var _require$requireLib2 = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib2.PydioContextConsumer;

var globalMessages = pydio.MessageHash;

var WelcomePanel = (function (_Component) {
    _inherits(WelcomePanel, _Component);

    function WelcomePanel() {
        _classCallCheck(this, WelcomePanel);

        _get(Object.getPrototypeOf(WelcomePanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(WelcomePanel, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                Paper,
                _extends({}, this.props, {
                    className: 'welcome-panel',
                    zDepth: 1,
                    transitionEnabled: false
                }),
                this.props.closeButton,
                React.createElement(
                    'div',
                    { className: 'screencast' },
                    React.createElement('img', { src: 'plug/access.ajxp_admin/images/screencast.gif' })
                ),
                React.createElement(
                    'h4',
                    null,
                    this.props.getMessage("home.44")
                ),
                React.createElement('div', { className: 'getting-started-content', dangerouslySetInnerHTML: { __html: this.props.getMessage('home.getting_started') } }),
                React.createElement(FlatButton, {
                    style: { position: 'absolute', right: 10, bottom: 10 },
                    primary: true,
                    label: this.props.getMessage('home.45'),
                    onTouchTap: this.props.onCloseAction
                })
            );
        }
    }]);

    return WelcomePanel;
})(Component);

exports['default'] = WelcomePanel = PydioContextConsumer(WelcomePanel);
exports['default'] = WelcomePanel = asGridItem(WelcomePanel, globalMessages['ajxp_admin.home.44'], { gridWidth: 8, gridHeight: 15 }, []);

exports['default'] = WelcomePanel;
module.exports = exports['default'];
