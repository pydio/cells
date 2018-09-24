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

        /**
         *
         * @param service Object
         * @param tag String
         * @param showDescription boolean
         * @param m Function
         * @return {*}
         */
        value: function renderServiceLine(service, tag, showDescription, m) {
            var iconColor = service.Status === 'STARTED' ? '#33691e' : '#d32f2f';

            var isGrpc = service.Name.startsWith('pydio.grpc.');
            var legend = isGrpc ? "Grpc" : "Rest";

            if (tag === 'gateway') {
                legend = service.Name.split('.').pop();
            } else if (tag === 'datasource') {
                if (service.Name.startsWith('pydio.grpc.data.sync.')) {
                    legend = m('datasource.sync');
                } else if (service.Name.startsWith('pydio.grpc.data.objects.')) {
                    legend = m('datasource.objects');
                } else if (service.Name.startsWith('pydio.grpc.data.index.')) {
                    legend = m('datasource.index');
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

            var style = {
                display: 'flex', alignItems: 'center',
                margin: '6px 8px',
                backgroundColor: '#F5F5F5',
                padding: '8px 6px',
                borderRadius: 2
            };

            return _react2['default'].createElement(
                'div',
                { style: style },
                _react2['default'].createElement(_materialUi.FontIcon, { style: { margin: '0 9px 0 4px', fontSize: 20 }, className: "mdi-traffic-light", color: iconColor }),
                _react2['default'].createElement(
                    'span',
                    { style: { flex: 1 } },
                    peers.join(', ')
                ),
                showDescription && _react2['default'].createElement(
                    'span',
                    { style: { fontStyle: 'italic', paddingRight: 6, fontWeight: 500, color: '#9e9e9e' } },
                    legend
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
            var pydio = _props.pydio;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.services.service.' + id] || id;
            };

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
                    description = m('datasource.objects.legend');
                } else {
                    description = m('datasource.legend');
                }
            }

            var styles = {
                container: {
                    flex: 1, minWidth: 200, margin: 4, display: 'flex', flexDirection: 'column'
                },
                title: {
                    padding: 8, fontSize: 16, fontWeight: 500, borderBottom: '1px solid #eee'
                },
                description: {
                    padding: 8, flex: 1
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
                showDescription && _react2['default'].createElement(
                    'div',
                    { style: styles.description },
                    description
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    services.map(function (service) {
                        return _this.renderServiceLine(service, tagId, showDescription, m);
                    })
                )
            );
        }
    }]);

    return ServiceCard;
})(_react2['default'].Component);

exports['default'] = ServiceCard;
module.exports = exports['default'];
