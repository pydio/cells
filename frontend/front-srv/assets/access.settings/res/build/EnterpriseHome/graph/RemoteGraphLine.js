'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _require = require('react-chartjs');

var Line = _require.Line;

var RemoteGraphLine = React.createClass({
    displayName: 'RemoteGraphLine',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        queryName: React.PropTypes.string,
        start: React.PropTypes.number,
        count: React.PropTypes.number,
        frequency: React.PropTypes.string,
        onDataLoaded: React.PropTypes.func,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        chartOptions: React.PropTypes.object,
        filters: React.PropTypes.object
    },

    triggerReload: function triggerReload() {
        this.loadData();
    },

    getDefaultProps: function getDefaultProps() {
        return {
            start: 0,
            count: 7,
            width: 300,
            height: 200,
            frequency: 'auto',
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
            chartData: { labels: [], datasets: [] }
        };
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (nextProps.start != this.props.start || nextProps.count != this.props.count) {
            this.setState({ newLoad: true });
        }
        if (nextProps.width && parseInt(nextProps.width) != this.props.width && this.refs.chart) {
            //this.refs.chart.getChart().resize();
        }
    },

    componentDidMount: function componentDidMount() {
        this.firstLoad = global.setTimeout(this.loadData, 500);
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
        this.firstLoad = null;
        var parameters = {
            get_action: 'analytic_query',
            query_name: this.props.queryName,
            start: this.props.start,
            count: this.props.count,
            frequency: this.props.frequency
        };
        if (this.props.filters) {
            parameters = LangUtils.objectMerge(parameters, this.props.filters);
        }
        PydioApi.getClient().request(parameters, (function (transport) {
            if (!this.isMounted()) return;
            this.parseData(this.props.queryName, transport.responseJSON);
        }).bind(this));
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
                preparedDataSets.push(this.makeDataSet(index, dLabel, datasets[qK]));
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

    makeDataSet: function makeDataSet(index, label, data) {
        var colors = ['220,220,220', '151,187,205', '70, 191, 189'];
        index = index % colors.length;
        return {
            label: label,
            fillColor: "rgba(" + colors[index] + ",0.2)",
            strokeColor: "rgba(" + colors[index] + ",1)",
            pointColor: "rgba(" + colors[index] + ",1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(" + colors[index] + ",1)",
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
            chart = React.createElement(Line, {
                ref: 'chart',
                key: 'chart',
                data: this.state.chartData,
                options: this.props.chartOptions,
                width: this.props.width,
                height: this.props.height
            });
        } else {
            chart = React.createElement(
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
