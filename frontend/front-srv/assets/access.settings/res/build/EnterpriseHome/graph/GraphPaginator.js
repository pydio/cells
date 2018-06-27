"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var GraphPaginator = React.createClass({
    displayName: "GraphPaginator",

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        start: React.PropTypes.number.isRequired,
        count: React.PropTypes.number.isRequired,
        onRangeChange: React.PropTypes.func.isRequired,
        links: React.PropTypes.array,
        pickerOnShow: React.PropTypes.func,
        pickerOnDismiss: React.PropTypes.func
    },

    getInitialState: function getInitialState() {
        return { paginatorType: 'pages' };
    },

    makeLink: function makeLink(type, links) {
        var found,
            clickFunc = function clickFunc() {};
        links.map((function (l) {
            if (l.rel != type) return;
            found = true;
            clickFunc = (function () {
                this.props.onRangeChange(l.cursor, l.count);
            }).bind(this);
        }).bind(this));
        var icon;
        if (type == "last") icon = "double-angle-left";
        if (type == "next") icon = "angle-left";
        if (type == "previous") icon = "angle-right";
        if (type == "first") icon = "double-angle-right";
        return React.createElement(ReactMUI.IconButton, {
            key: type,
            iconClassName: 'icon-' + icon,
            onClick: clickFunc,
            disabled: !found
        });
    },

    componentDidUpdate: function componentDidUpdate() {
        if (this.refs.startDate) {
            var startDate = this.cursorToDate(this.props.start + this.props.count);
            this.refs.startDate.setDate(startDate);
        }
        if (this.refs.endDate) {
            var endDate = this.cursorToDate(this.props.start);
            this.refs.endDate.setDate(endDate);
        }
    },

    togglePaginatorType: function togglePaginatorType() {
        this.setState({
            paginatorType: this.state.paginatorType == 'dates' ? 'pages' : 'dates'
        });
    },

    recomputeStartCountFromDates: function recomputeStartCountFromDates(dateType, value) {
        var today = new Date();
        var start = this.props.start,
            count = this.props.count;
        if (dateType == 'end') {
            start = this.compareDates(today, value);
            var currentStartCursor = this.props.start + this.props.count;
            if (start > currentStartCursor) {
                count = 7;
            } else {
                count = currentStartCursor - start;
            }
        } else if (dateType == 'start') {
            var total = this.compareDates(today, value);
            count = total - start;
        }
        if (start != this.props.start || count != this.props.count) {
            this.props.onRangeChange(start, count);
        }
    },

    compareDates: function compareDates(date1, date2) {
        date1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
        date2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
        var ms = Math.abs(date1 - date2);
        return Math.floor(ms / 1000 / 60 / 60 / 24); //floor should be unnecessary, but just in case
    },

    cursorToDate: function cursorToDate(integer) {
        var today = new Date();
        var newDate = new Date();
        newDate.setDate(today.getDate() - integer);
        return newDate;
    },

    render: function render() {

        var links = [];
        links.push(React.createElement(ReactMUI.IconButton, {
            key: "paginatorToggle",
            onClick: this.togglePaginatorType,
            iconClassName: "icon-" + (this.state.paginatorType == 'pages' ? 'calendar' : 'anchor'),
            tooltip: this.state.paginatorType == 'pages' ? this.context.getMessage('home.2') : this.context.getMessage('home.3')
        }));
        if (this.props.links && this.state.paginatorType == 'pages') {
            //links.push(this.makeLink('last', this.state.links));
            links.push(this.makeLink('next', this.props.links));
            links.push(this.makeLink('previous', this.props.links));
            links.push(this.makeLink('first', this.props.links));
        } else if (this.state.paginatorType == 'dates') {
            var today = new Date();
            var startDate = this.cursorToDate(this.props.start + this.props.count);
            var endDate = this.cursorToDate(this.props.start);
            var recomputeStart = (function (event, value) {
                this.recomputeStartCountFromDates('start', value);
            }).bind(this);
            var recomputeEnd = (function (event, value) {
                this.recomputeStartCountFromDates('end', value);
            }).bind(this);
            links.push(React.createElement(
                "div",
                { className: "paginator-dates" },
                React.createElement(ReactMUI.DatePicker, {
                    ref: "startDate",
                    onChange: recomputeStart,
                    key: "start",
                    hintText: this.context.getMessage('home.4'),
                    autoOk: true,
                    maxDate: endDate,
                    defaultDate: startDate,
                    showYearSelector: true,
                    onShow: this.props.pickerOnShow,
                    onDismiss: this.props.pickerOnDismiss
                }),
                React.createElement(ReactMUI.DatePicker, {
                    ref: "endDate",
                    onChange: recomputeEnd,
                    key: "end",
                    hintText: this.context.getMessage('home.5'),
                    autoOk: true,
                    minDate: startDate,
                    maxDate: today,
                    defaultDate: endDate,
                    showYearSelector: true,
                    onShow: this.props.pickerOnShow,
                    onDismiss: this.props.pickerOnDismiss
                })
            ));
        }

        return React.createElement(
            "div",
            { className: "graphs-paginator" },
            links
        );
    }
});

exports["default"] = GraphPaginator;
module.exports = exports["default"];
