'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var removeComments = function removeComments(str) {
    return str.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "").replace(/(\r\n|\n|\r)/gm, "");
};

var styles = {
    highlighted: {
        backgroundColor: "rgba(204, 204, 204, 0.2)"
    },
    selectable: {
        backgroundColor: "rgba(255, 215, 0, 0.2)"
    }
};

var Ws2TemplatePaths = (function (_React$Component) {
    _inherits(Ws2TemplatePaths, _React$Component);

    function Ws2TemplatePaths() {
        _classCallCheck(this, Ws2TemplatePaths);

        _get(Object.getPrototypeOf(Ws2TemplatePaths.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Ws2TemplatePaths, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var title = _props.title;
            var selectable = _props.selectable;
            var highlighted = _props.highlighted;
            var templatePaths = _props.templatePaths;
            var onCreate = _props.onCreate;
            var onSelect = _props.onSelect;

            return _react2['default'].createElement(
                _materialUi.List,
                { style: { flex: 1 } },
                templatePaths.map(function (templatePath, idx) {
                    return _react2['default'].createElement(TemplatePath, {
                        selectable: selectable(templatePath),
                        highlighted: highlighted(templatePath),
                        templatePath: templatePath,
                        onSelect: function (tp) {
                            return onSelect(tp);
                        }
                    });
                })
            );
        }
    }]);

    return Ws2TemplatePaths;
})(_react2['default'].Component);

var TemplatePath = (function (_React$Component2) {
    _inherits(TemplatePath, _React$Component2);

    function TemplatePath() {
        _classCallCheck(this, TemplatePath);

        _get(Object.getPrototypeOf(TemplatePath.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(TemplatePath, [{
        key: 'handleSelect',
        value: function handleSelect() {
            var _props2 = this.props;
            var templatePath = _props2.templatePath;
            var onSelect = _props2.onSelect;

            onSelect(templatePath);
        }
    }, {
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props3 = this.props;
            var selectable = _props3.selectable;
            var highlighted = _props3.highlighted;
            var templatePath = _props3.templatePath;

            var style = this.props.style;

            if (highlighted) {
                style = _extends({}, style, styles.highlighted);
            }

            if (!templatePath) {
                return _react2['default'].createElement(_materialUi.ListItem, { style: style, leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-folder-outline" }), primaryText: this.T('step.mapper.notplpath.primary'), secondaryText: this.T('step.mapper.notplpath.secondary') });
            }

            if (selectable) {
                style = _extends({}, style, styles.selectable);
            }

            return _react2['default'].createElement(_materialUi.ListItem, {
                style: style,
                leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-file-tree" }),
                primaryText: templatePath.Path,
                secondaryText: removeComments(templatePath.MetaStore.resolution),
                disabled: !selectable,
                onClick: function () {
                    return _this.handleSelect();
                }
            });
        }
    }]);

    return TemplatePath;
})(_react2['default'].Component);

exports['default'] = Ws2TemplatePaths;
module.exports = exports['default'];
