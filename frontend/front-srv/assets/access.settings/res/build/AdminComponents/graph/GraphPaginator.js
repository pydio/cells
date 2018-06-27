'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMixins = require('../util/Mixins');

var GraphPaginator = _react2['default'].createClass({
    displayName: 'GraphPaginator',

    mixins: [_utilMixins.MessagesConsumerMixin],

    propTypes: {
        start: _react2['default'].PropTypes.number.isRequired,
        onRangeChange: _react2['default'].PropTypes.func.isRequired,
        links: _react2['default'].PropTypes.array,
        pickerOnShow: _react2['default'].PropTypes.func,
        pickerOnDismiss: _react2['default'].PropTypes.func
    },

    getInitialState: function getInitialState() {
        return { paginatorType: 'pages' };
    },

    makeLink: function makeLink(type, links) {
        var found,
            clickFunc = function clickFunc() {};
        links.map((function (l) {
            if (l.Rel !== type) return;
            found = true;
            clickFunc = (function () {
                this.props.onRangeChange(l.RefTime, l.Count);
            }).bind(this);
        }).bind(this));
        var icon;
        if (type === "LAST") icon = "chevron-double-left";
        if (type === "NEXT") icon = "chevron-left";
        if (type === "PREV") icon = "chevron-right";
        if (type === "FIRST") icon = "chevron-double-right";
        return _react2['default'].createElement(_materialUi.IconButton, {
            key: type,
            iconClassName: 'mdi mdi-' + icon,
            onTouchTap: clickFunc,
            disabled: !found
        });
    },

    render: function render() {
        var _this = this;

        var frequency = this.props.frequency;

        var links = [];
        links.push(_react2['default'].createElement(
            _materialUi.IconMenu,
            {
                key: 'paginatorMenu',
                iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-calendar-clock", iconStyle: { color: '#9e9e9e' }, tooltip: 'Time Range' }),
                desktop: true,
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                targetOrigin: { horizontal: 'right', vertical: 'top' }
            },
            [{ f: 'H', l: 'Last Hour' }, { f: 'D', l: 'Last Day' }, { f: 'W', l: 'Last Week' }, { f: 'M', l: 'Last Month' }, { f: 'Y', l: 'Last Year' }].map(function (entry) {
                return _react2['default'].createElement(_materialUi.MenuItem, {
                    insetChildren: frequency !== entry.f,
                    primaryText: entry.l,
                    onTouchTap: function () {
                        return _this.props.onFrequencyChange(entry.f);
                    },
                    leftIcon: frequency === entry.f ? _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) : null
                });
            })
        ));
        if (this.props.links) {
            links.push(this.makeLink('NEXT', this.props.links));
            links.push(this.makeLink('PREV', this.props.links));
            links.push(this.makeLink('FIRST', this.props.links));
        }

        return _react2['default'].createElement(
            'div',
            { className: 'graphs-paginator' },
            links
        );
    }
});

exports['default'] = GraphPaginator;
module.exports = exports['default'];
