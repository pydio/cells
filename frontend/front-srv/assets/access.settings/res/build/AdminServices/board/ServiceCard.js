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

var _materialUi = require('material-ui');

var ServiceCard = (function (_React$Component) {
    _inherits(ServiceCard, _React$Component);

    function ServiceCard() {
        _classCallCheck(this, ServiceCard);

        _get(Object.getPrototypeOf(ServiceCard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ServiceCard, [{
        key: 'renderServiceLine',
        value: function renderServiceLine(service, tag) {
            var iconColor = service.Status === 'STARTED' ? '#33691e' : '#d32f2f';

            var isGrpc = service.Name.startsWith('pydio.grpc.');
            var legend = isGrpc ? "Grpc" : "Rest";

            if (tag === 'gateway') {
                legend = service.Name.split('.').pop();
            } else if (tag === 'datasource') {
                if (service.Name.startsWith('pydio.grpc.data.sync.')) {
                    legend = "Sync";
                } else if (service.Name.startsWith('pydio.grpc.data.objects.')) {
                    legend = "S3";
                } else if (service.Name.startsWith('pydio.grpc.data.index.')) {
                    legend = "Indexation";
                }
            }

            var peers = [];
            if (service.Status === 'STARTED' && service.RunningPeers) {
                service.RunningPeers.map(function (p) {
                    peers.push(p.Address + ':' + p.Port);
                });
            } else {
                peers.push('N/A');
            }

            return _react2['default'].createElement(
                'div',
                { style: { padding: '8px' } },
                _react2['default'].createElement(
                    'div',
                    { style: { fontWeight: 500, color: '#9e9e9e' } },
                    legend
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', marginTop: 6 } },
                    _react2['default'].createElement(_materialUi.FontIcon, { style: { margin: '0 9px 0 4px', fontSize: 20 }, className: "mdi-traffic-light", color: iconColor }),
                    _react2['default'].createElement(
                        'span',
                        null,
                        peers.join(', ')
                    )
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var title = _props.title;
            var services = _props.services;
            var tagId = _props.tagId;
            var showDescription = _props.showDescription;

            var grpcDescription = undefined;
            if (services.length > 1) {
                services.map(function (s) {
                    if (s.Name.startsWith('pydio.grpc.')) {
                        grpcDescription = s.Description;
                    }
                });
            }
            var description = grpcDescription || services[0].Description;
            if (!description && tagId === 'datasource') {
                if (services[0].Name.startsWith('pydio.grpc.data.objects.')) {
                    description = "S3 layer to serve data from storage";
                } else {
                    description = "Datasource is synchronizing data from objects to index";
                }
            }

            var styles = {
                container: {
                    width: 200, margin: 8, display: 'flex', flexDirection: 'column'
                },
                title: {
                    padding: 8, fontSize: 16, backgroundColor: '#607D8B', color: 'white'
                },
                description: {
                    padding: 8, color: 'rgba(0,0,0,0.53)', borderTop: '1px solid #eee'
                }
            };

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: styles.container },
                _react2['default'].createElement(
                    'div',
                    { style: styles.title },
                    title
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    services.map(function (service) {
                        return _this.renderServiceLine(service, tagId);
                    })
                ),
                showDescription && _react2['default'].createElement(
                    'div',
                    { style: styles.description },
                    description
                )
            );
        }
    }]);

    return ServiceCard;
})(_react2['default'].Component);

exports['default'] = ServiceCard;
module.exports = exports['default'];
