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

var _utilReloadWrapper = require('../util/ReloadWrapper');

var _utilReloadWrapper2 = _interopRequireDefault(_utilReloadWrapper);

var _graphRemoteGraphLine = require('../graph/RemoteGraphLine');

var _graphRemoteGraphLine2 = _interopRequireDefault(_graphRemoteGraphLine);

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var Paper = _require2.Paper;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var GraphBadge = (function (_Component) {
    _inherits(GraphBadge, _Component);

    function GraphBadge(props, context) {
        _classCallCheck(this, GraphBadge);

        _get(Object.getPrototypeOf(GraphBadge.prototype), 'constructor', this).call(this, props, context);
        this.state = { figure: this.props.figure || '-' };
    }

    _createClass(GraphBadge, [{
        key: 'triggerReload',
        value: function triggerReload() {
            this.refs['chart'].triggerReload();
        }
    }, {
        key: 'onLoadedData',
        value: function onLoadedData(receivedData, preparedDataSet) {
            // Count total of all values
            var figure = 0;
            try {
                var data = preparedDataSet[0].data;
                if (data.length) {
                    data.map(function (value) {
                        figure += value;
                    });
                }
            } catch (e) {}
            if (!figure) figure = '-';
            this.setState({ figure: figure });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var style = _props.style;
            var className = _props.className;
            var frequency = _props.frequency;
            var workspaceFilter = _props.workspaceFilter;
            var filenameFilter = _props.filenameFilter;
            var closeButton = _props.closeButton;
            var queryName = _props.queryName;
            var muiTheme = _props.muiTheme;
            var legend = _props.legend;

            var containerW = parseInt(style.width);
            var containerH = parseInt(style.height);

            var chartOptions = {
                showScale: false,
                showTooltip: false,
                showGridLines: false,
                pointDot: false,
                bezierCurveTension: 0.3,
                datasetStrokeWidth: 0,
                showTooltips: false,
                responsive: true,
                maintainAspectRatio: false
            };
            var filters = {};
            if (workspaceFilter && workspaceFilter != -1) {
                filters["ws_id"] = workspaceFilter;
            }
            if (filenameFilter) {
                filters["filename_filter"] = filenameFilter;
            }

            return React.createElement(
                Paper,
                _extends({
                    transitionEnabled: false
                }, this.props, {
                    className: (className ? className + ' ' : '') + 'graphs-badge',
                    zDepth: 1,
                    style: style }),
                closeButton,
                React.createElement(
                    'div',
                    { className: 'badge-canvas-container' },
                    React.createElement(_graphRemoteGraphLine2['default'], {
                        ref: 'chart',
                        queryName: queryName,
                        start: 0,
                        colorIndex: 0,
                        frequency: frequency,
                        width: containerW + 10,
                        height: containerH + 5,
                        chartOptions: chartOptions,
                        onDataLoaded: this.onLoadedData.bind(this),
                        filters: filters
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'badge-content', style: { borderLeft: '3px solid ' + muiTheme.palette.primary1Color } },
                    React.createElement(
                        'h4',
                        { className: 'figure' },
                        this.state.figure
                    ),
                    React.createElement(
                        'div',
                        { className: 'legend' },
                        legend
                    )
                )
            );
        }
    }]);

    return GraphBadge;
})(Component);

GraphBadge.propTypes = {
    queryName: PropTypes.string,
    defaultInterval: PropTypes.number,
    figure: PropTypes.number,
    frequency: PropTypes.string,
    legend: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string
};

var globalMessages = global.pydio.MessageHash;
var gridData = {
    gridDimension: {
        gridWidth: 2,
        gridHeight: 6
    },
    builderDisplayName: globalMessages['ajxp_admin.home.19'],
    builderFields: [{ name: 'legend', label: globalMessages['ajxp_admin.home.12'], type: 'string', mandatory: true }, { name: 'queryName',
        label: globalMessages['ajxp_admin.home.21'],
        type: 'select',
        choices: '' + 'uploads_per_day|' + globalMessages['ajxp_admin.home.22'] + ',' + 'downloads_per_day|' + globalMessages['ajxp_admin.home.23'] + ',' + 'sharedfiles_per_day|' + globalMessages['ajxp_admin.home.24'] + ',' + 'connections_per_day|' + globalMessages['ajxp_admin.home.25']
    }, {
        name: 'frequency',
        label: globalMessages['ajxp_admin.home.29'],
        type: 'select',
        choices: "" + "day|" + globalMessages['ajxp_admin.home.26'] + "," + "week|" + globalMessages['ajxp_admin.home.27'] + "," + "month|" + globalMessages['ajxp_admin.home.28'],
        'default': 'day',
        mandatory: true
    }, { name: 'workspaceFilter', label: globalMessages['ajxp_admin.home.69'], type: 'select', choices: 'AJXP_AVAILABLE_REPOSITORIES', description: globalMessages['ajxp_admin.home.70'] }, { name: 'filenameFilter', label: globalMessages['ajxp_admin.home.71'], description: globalMessages['ajxp_admin.home.72'], type: 'string' }, { name: 'interval', label: globalMessages['ajxp_admin.home.18'], type: 'integer', 'default': 300 }]
};

exports['default'] = GraphBadge = (0, _utilReloadWrapper2['default'])(GraphBadge);
exports['default'] = GraphBadge = asGridItem(GraphBadge, gridData.builderDisplayName, gridData.gridDimension, gridData.builderFields);
exports['default'] = GraphBadge;
module.exports = exports['default'];
