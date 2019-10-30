'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

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

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var _workspacesLoader = require("../workspaces/Loader");

var _workspacesLoader2 = _interopRequireDefault(_workspacesLoader);

var _workspacesMetadataMapper = require("../workspaces/MetadataMapper");

var _workspacesMetadataMapper2 = _interopRequireDefault(_workspacesMetadataMapper);

var StepMetadata = (function (_React$Component) {
    _inherits(StepMetadata, _React$Component);

    function StepMetadata(props) {
        _classCallCheck(this, StepMetadata);

        _get(Object.getPrototypeOf(StepMetadata.prototype), 'constructor', this).call(this, props);

        this.state = {
            features: {
                "watches": { label: this.T('feature.watches'), checked: true },
                "bookmarks": { label: this.T('feature.bookmark'), checked: true },
                "filesMeta": { label: this.T('feature.files'), checked: true }
            }
        };
    }

    _createClass(StepMetadata, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.meta.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            var loader = new _workspacesLoader2['default']();
            var _props = this.props;
            var url = _props.url;
            var user = _props.user;
            var pwd = _props.pwd;

            loader.loadWorkspaces(url, user, pwd)['catch'](function (err) {
                _this.setState({ err: err });
            }).then(function (workspaces) {
                _this.setState({ workspaces: workspaces }, function () {
                    _this.exportFeatures();
                });
            });
        }
    }, {
        key: 'exportFeatures',
        value: function exportFeatures() {
            var features = this.state.features;
            var onChange = this.props.onChange;

            var c = [];
            Object.keys(features).forEach(function (k) {
                if (features[k].checked) {
                    c.push(k);
                }
            });
            onChange({ metadataFeatures: c });
        }
    }, {
        key: 'toggle',
        value: function toggle(featureName, checked) {
            var _this2 = this;

            var features = this.state.features;

            features[featureName].checked = checked;
            this.setState({ features: features }, function () {
                _this2.exportFeatures();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props;
            var pydio = _props2.pydio;
            var onBack = _props2.onBack;
            var onChange = _props2.onChange;
            var onComplete = _props2.onComplete;
            var styles = _props2.styles;
            var _state = this.state;
            var workspaces = _state.workspaces;
            var err = _state.err;
            var features = _state.features;

            return _react2['default'].createElement(
                _materialUi.Step,
                this.props,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    this.T('title')
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        this.T('legend')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '10px 0' } },
                        Object.keys(features).map(function (k) {
                            var f = features[k];
                            return _react2['default'].createElement(_materialUi.Checkbox, { style: { padding: '6px 0' }, label: f.label, checked: f.checked, onCheck: function (e, v) {
                                    _this3.toggle(k, v);
                                } });
                        })
                    ),
                    workspaces && features['filesMeta'].checked && _react2['default'].createElement(_workspacesMetadataMapper2['default'], {
                        pydio: pydio,
                        workspaces: workspaces,
                        onMapped: function (data) {
                            var mapping = data.mapping;
                            var create = data.create;

                            onChange({ metadataMapping: mapping, metadataCreate: create });
                        }
                    }),
                    err && _react2['default'].createElement(
                        'div',
                        null,
                        err.message
                    ),
                    _react2['default'].createElement(
                        _StepActions2['default'],
                        null,
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onBack();
                            },
                            label: this.T('back')
                        }),
                        '  ',
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onComplete();
                            },
                            label: this.T('next'),
                            primary: true
                        })
                    )
                )
            );
        }
    }]);

    return StepMetadata;
})(_react2['default'].Component);

exports['default'] = StepMetadata;
module.exports = exports['default'];
