'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utilMixins = require("../util/Mixins");

var _reactChartjs = require('react-chartjs');

var _GraphModel = require('./GraphModel');

var _GraphModel2 = _interopRequireDefault(_GraphModel);

var RemoteGraphLine = _react2['default'].createClass({
    displayName: 'RemoteGraphLine',

    mixins: [_utilMixins.MessagesConsumerMixin],

    propTypes: {
        queryName: _react2['default'].PropTypes.string,
        start: _react2['default'].PropTypes.number,
        frequency: _react2['default'].PropTypes.string,
        onDataLoaded: _react2['default'].PropTypes.func,
        width: _react2['default'].PropTypes.number,
        height: _react2['default'].PropTypes.number,
        chartOptions: _react2['default'].PropTypes.object,
        filters: _react2['default'].PropTypes.object
    },

    triggerReload: function triggerReload() {
        this.loadData();
    },

    getDefaultProps: function getDefaultProps() {
        return {
            start: 0,
            width: 300,
            height: 200,
            frequency: 'H',
            onDataLoaded: function onDataLoaded() {},
            chartOptions: {
                responsive: true,
                useCSSTransforms: false,
                maintainAspectRatio: false,
                tooltipTemplate: "<%= value %> <%= datasetLabel %>",
                multiTooltipTemplate: "<%= value %> <%= datasetLabel %>"
            }
        };
    },

    getInitialState: function getInitialState() {
        return {
            loaded: false,
            colorIndex: Math.floor(Math.random() * 100) % 3,
            chartData: { labels: [], datasets: [] }
        };
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (nextProps.start !== this.props.start || nextProps.frequency !== this.props.frequency) {
            this.setState({ newLoad: true });
        }
    },

    componentDidMount: function componentDidMount() {
        this.firstLoad = setTimeout(this.loadData, 500);
        //this.loadData();
    },

    componentWillUnmount: function componentWillUnmount() {
        if (this.firstLoad) {
            global.clearTimeout(this.firstLoad);
        }
    },

    componentDidUpdate: function componentDidUpdate() {
        if (this.state.newLoad) {
            this.setState({ newLoad: false }, this.loadData);
        }
    },

    loadData: function loadData() {
        var _this = this;

        this.firstLoad = null;
        var model = new _GraphModel2['default']();
        var _props = this.props;
        var queryName = _props.queryName;
        var frequency = _props.frequency;
        var start = _props.start;

        var queries = queryName.split(",");
        Promise.all(queries.map(function (q) {
            return model.loadData(q, frequency, start);
        })).then(function (results) {
            var dataSets = [];
            var theLabels = undefined,
                theLinks = undefined;
            queries.forEach(function (qName, index) {
                var _results$index = results[index];
                var labels = _results$index.labels;
                var points = _results$index.points;
                var links = _results$index.links;

                var dataSet = _this.makeDataSet(qName, points, index);
                dataSets.push(dataSet);
                theLabels = labels;
                theLinks = links;
            });
            _this.setState({
                chartData: {
                    labels: theLabels,
                    datasets: dataSets
                },
                links: theLinks,
                loaded: true
            });
            _this.props.onDataLoaded({ links: theLinks }, dataSets);
        })['catch'](function (reason) {
            // Todo
        });
    },

    parseData: function parseData(queryName, jsonData) {
        if (jsonData.data instanceof Array) {
            jsonData.data = { unique: jsonData.data };
        }
        if (jsonData.meta instanceof Array) {
            jsonData.meta = { unique: jsonData.meta };
        }
        var received = jsonData.data;
        // TO BE TAKEN FROM CONFIG
        var sortKey = 'Date_sortable';
        var labelKey = 'Date';
        var labels = [];
        var datasets = {};
        var datasetsLabels = {};

        // First compute all keys
        var presort = [];
        var presortLabels = {};
        var foundLabels = [];
        for (var k in received) {
            if (!received.hasOwnProperty(k)) continue;
            datasets[k] = [];
            received[k].map(function (entry) {
                if (foundLabels.indexOf(entry[labelKey]) === -1) {
                    presort.push(entry[sortKey]);
                    presortLabels[entry[sortKey]] = entry[labelKey]; //.replace(' 2015', '');
                    foundLabels.push(entry[labelKey]);
                }
            });
        }
        presort.sort();
        presort.map(function (sortedKey) {
            for (var k in received) {
                if (!received.hasOwnProperty(k)) continue;
                var foundEntry = null;
                received[k].map(function (entry) {
                    if (entry[labelKey] == presortLabels[sortedKey]) {
                        foundEntry = entry;
                    }
                });
                var value = 0;
                if (foundEntry) {
                    // find a value key here
                    for (var prop in foundEntry) {
                        if (!foundEntry.hasOwnProperty(prop) || prop == sortKey || prop == labelKey) continue;
                        value = foundEntry[prop];
                        datasetsLabels[k] = prop;
                        break;
                    }
                }
                datasets[k].push(value);
                if (!datasetsLabels[k] && jsonData.meta && jsonData.meta[k]) {
                    var meta = jsonData.meta[k];
                    if (meta['AXIS'] && meta['AXIS']['y']) datasetsLabels[k] = meta['AXIS']['y'];else datasetsLabels[k] = meta['LABEL'];
                }
            }
            labels.push(presortLabels[sortedKey].replace(' 2015', ''));
        });
        var preparedDataSets = [];
        var index = 0;
        for (var qK in datasets) {
            if (datasets.hasOwnProperty(qK)) {
                var dLabel = datasetsLabels[qK] || '';
                preparedDataSets.push(this.makeDataSet(dLabel, datasets[qK]));
                index++;
            }
        }
        this.setState({
            chartData: {
                labels: labels,
                datasets: preparedDataSets
            },
            links: jsonData.links,
            loaded: true
        });
        this.props.onDataLoaded(jsonData, preparedDataSets);
    },

    makeDataSet: function makeDataSet(label, data, index) {
        //const colors = ['70, 191, 189','151,187,205','220,220,220'];
        var colors = ['0, 150, 136', '33,150,243', '255,87,34'];
        var color = colors[index];
        return {
            label: label,
            fillColor: "rgba(" + color + ",0.2)",
            strokeColor: "rgba(" + color + ",1)",
            pointColor: "rgba(" + color + ",1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(" + color + ",1)",
            data: data
        };
    },

    resizeChart: function resizeChart() {
        if (this.refs['chart']) {
            this.refs['chart'].getChart().resize();
        }
    },

    render: function render() {
        var chart;
        if (this.state.loaded) {
            chart = _react2['default'].createElement(_reactChartjs.Line, {
                ref: 'chart',
                key: 'chart',
                data: this.state.chartData,
                options: this.props.chartOptions,
                width: this.props.width,
                height: this.props.height
            });
        } else {
            chart = _react2['default'].createElement(
                'div',
                { className: 'graph-loading' },
                this.context.getMessage('home.6', 'ajxp_admin')
            );
        }
        return chart;
    }
});

exports['default'] = RemoteGraphLine;
module.exports = exports['default'];
