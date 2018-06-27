'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var GroupAdminDashboard = _react2['default'].createClass({
    displayName: 'GroupAdminDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    renderLink: function renderLink(node) {

        var label = _react2['default'].createElement(
            'span',
            null,
            _react2['default'].createElement('span', { className: node.iconClass + ' button-icon' }),
            ' ',
            node.label
        );
        return _react2['default'].createElement(
            'span',
            { style: { display: 'inline-block', margin: '0 5px' } },
            _react2['default'].createElement(_materialUi.RaisedButton, {
                key: node.path,
                secondary: true,
                onClick: function () {
                    pydio.goTo(node.path);
                },
                label: label
            })
        );
    },

    render: function render() {

        var baseNodes = [{
            path: '/data/users',
            label: this.context.getMessage('249', ''),
            iconClass: 'icon-user'
        }, {
            path: '/data/repositories',
            label: this.context.getMessage('250', ''),
            iconClass: 'icon-hdd'
        }];
        return _react2['default'].createElement(
            'div',
            { style: { width: '100%', height: '100%' } },
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: { margin: 10 } },
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 10 } },
                    this.context.getMessage('home.67')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 10, textAlign: 'center' } },
                    baseNodes.map((function (n) {
                        return this.renderLink(n);
                    }).bind(this)),
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement(_materialUi.FlatButton, {
                        label: this.context.getMessage('home.68'),
                        secondary: true,
                        onClick: function () {
                            pydio.triggerRepositoryChange("ajxp_home");
                        }
                    })
                )
            )
        );
    }

});

exports['default'] = GroupAdminDashboard;
module.exports = exports['default'];
