'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilHasher = require('pydio/util/hasher');

var _pydioUtilHasher2 = _interopRequireDefault(_pydioUtilHasher);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var styles = {
    highlighted: {
        backgroundColor: "rgba(204, 204, 204, 0.2)"
    },
    selectable: {
        backgroundColor: "rgba(255, 215, 0, 0.2)"
    }
};

var Ws2Datasources = (function (_React$Component) {
    _inherits(Ws2Datasources, _React$Component);

    function Ws2Datasources(props) {
        _classCallCheck(this, Ws2Datasources);

        _get(Object.getPrototypeOf(Ws2Datasources.prototype), 'constructor', this).call(this, props);

        this.state = {
            startedServices: []
        };
    }

    _createClass(Ws2Datasources, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            this.statusPoller = setInterval(function () {
                AdminWorkspaces.DataSource.loadStatuses().then(function (data) {
                    _this.setState({ startedServices: data.Services });
                });
            }, 2500);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            clearInterval(this.statusPoller);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var header = _props.header;
            var headerIcons = _props.headerIcons;
            var highlighted = _props.highlighted;
            var selectable = _props.selectable;
            var datasources = _props.datasources;
            var onCreate = _props.onCreate;
            var onSelect = _props.onSelect;
            var startedServices = this.state.startedServices;

            return _react2['default'].createElement(
                _materialUi.List,
                null,
                _react2['default'].createElement(
                    _materialUi.Subheader,
                    null,
                    header,
                    ' ',
                    headerIcons
                ),
                datasources.map(function (datasource, idx) {

                    var path = "";

                    // Check if selected datasource is properly running

                    var sync = startedServices.reduce(function (acc, service) {
                        return acc || service.Name === 'pydio.grpc.data.sync.' + datasource.Name;
                    }, false);
                    var index = startedServices.reduce(function (acc, service) {
                        return acc || service.Name === 'pydio.grpc.data.index.' + datasource.Name;
                    }, false);
                    var objects = startedServices.reduce(function (acc, service) {
                        return acc || service.Name === 'pydio.grpc.data.objects.' + datasource.ObjectsServiceName;
                    }, false);

                    return _react2['default'].createElement(Datasource, {
                        path: path,
                        selectable: selectable(datasource),
                        highlighted: highlighted(datasource),
                        datasource: datasource,
                        running: sync && index && objects,
                        onSelect: function (ds) {
                            return onSelect(ds);
                        }
                    });
                })
            );
        }
    }], [{
        key: 'toString',
        value: function toString(datasource) {
            var StorageType = datasource.StorageType;
            var _datasource$StorageConfiguration = datasource.StorageConfiguration;
            var StorageConfiguration = _datasource$StorageConfiguration === undefined ? {} : _datasource$StorageConfiguration;

            switch (StorageType) {
                case "S3":
                    var customEndpoint = StorageConfiguration.customEndpoint;

                    return customEndpoint ? "S3-compatible storage URL" : "Amazon S3";

                    break;
                default:
                    return StorageConfiguration.folder;
            }
        }
    }, {
        key: 'extractPath',
        value: function extractPath(datasource) {
            var StorageType = datasource.StorageType;
            var _datasource$StorageConfiguration2 = datasource.StorageConfiguration;
            var StorageConfiguration = _datasource$StorageConfiguration2 === undefined ? {} : _datasource$StorageConfiguration2;

            switch (StorageType) {
                case "S3":
                    var ApiKey = datasource.ApiKey,
                        ApiSecret = datasource.ApiSecret,
                        ObjectsBucket = datasource.ObjectsBucket,
                        ObjectsBaseFolder = datasource.ObjectsBaseFolder;
                    var customEndpoint = StorageConfiguration.customEndpoint;

                    var parts = [];
                    parts.push(customEndpoint ? 'custom:' + _pydioUtilHasher2['default'].base64_encode(customEndpoint) : 's3');
                    parts.push(ApiKey, ApiSecret);

                    parts.push(ObjectsBucket);

                    if (ObjectsBaseFolder) {
                        var paths = _pydioUtilLang2['default'].trim(ObjectsBaseFolder, '/').split('/');
                        parts.push.apply(parts, _toConsumableArray(paths));
                    }

                    return parts.join('/');

                    break;
                default:
                    return StorageConfiguration.folder;
            }
        }
    }]);

    return Ws2Datasources;
})(_react2['default'].Component);

var Datasource = (function (_React$Component2) {
    _inherits(Datasource, _React$Component2);

    function Datasource() {
        _classCallCheck(this, Datasource);

        _get(Object.getPrototypeOf(Datasource.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Datasource, [{
        key: 'handleSelect',
        value: function handleSelect() {
            var _props2 = this.props;
            var datasource = _props2.datasource;
            var onSelect = _props2.onSelect;

            onSelect(datasource);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props3 = this.props;
            var datasource = _props3.datasource;
            var selectable = _props3.selectable;
            var highlighted = _props3.highlighted;
            var running = _props3.running;
            var _datasource$StorageType = datasource.StorageType;
            var StorageType = _datasource$StorageType === undefined ? "" : _datasource$StorageType;

            var menuIcon = { lineHeight: '24px' };
            var icon = !running ? 'sync' : StorageType === 's3' ? 'cloud-circle' : 'folder';

            var style = this.props.style;

            if (highlighted) {
                style = _extends({}, style, styles.highlighted);
            }
            if (selectable) {
                style = _extends({}, style, styles.selectable);
            }

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.ListItem, {
                    leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: menuIcon, className: "mdi mdi-" + icon }),
                    primaryText: datasource.Name,
                    secondaryText: Ws2Datasources.toString(datasource),
                    style: style,
                    disabled: !selectable,
                    onClick: function () {
                        return _this2.handleSelect();
                    }
                })
            );
        }
    }]);

    return Datasource;
})(_react2['default'].Component);

exports['default'] = Ws2Datasources;
module.exports = exports['default'];
