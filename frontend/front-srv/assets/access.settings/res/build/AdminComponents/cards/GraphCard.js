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

var _graphGraphPaginator = require('../graph/GraphPaginator');

var _graphGraphPaginator2 = _interopRequireDefault(_graphGraphPaginator);

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var Paper = _require2.Paper;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var GraphCard = (function (_Component) {
    _inherits(GraphCard, _Component);

    function GraphCard(props, context) {
        _classCallCheck(this, GraphCard);

        _get(Object.getPrototypeOf(GraphCard.prototype), 'constructor', this).call(this, props, context);
        this.state = {
            start: 0,
            frequency: this.props.frequency || 'H'
        };
    }

    _createClass(GraphCard, [{
        key: 'triggerReload',
        value: function triggerReload() {
            if (this.state.start === 0) {
                this.refs['chart'].triggerReload();
            }
        }
    }, {
        key: 'onPaginatorChange',
        value: function onPaginatorChange(start) {
            this.setState({ start: start });
        }
    }, {
        key: 'onGraphDataLoaded',
        value: function onGraphDataLoaded(data) {
            this.setState({ links: data.links });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var containerW = parseInt(this.props.style.width);
            var containerH = parseInt(this.props.style.height);
            var className = (this.props.className ? this.props.className + ' ' : '') + 'graphs-card';

            var filters = this.props.filters || {};
            if (this.props.workspaceFilter && this.props.workspaceFilter != -1) {
                filters["ws_id"] = this.props.workspaceFilter;
            }
            if (this.props.filenameFilter) {
                filters["filename_filter"] = this.props.filenameFilter;
            }

            return React.createElement(
                Paper,
                _extends({}, this.props, {
                    className: className,
                    zDepth: this.props.zDepth,
                    transitionEnabled: false }),
                this.props.closeButton,
                React.createElement(_graphGraphPaginator2['default'], {
                    ref: 'paginator',
                    start: this.state.start,
                    links: this.state.links,
                    frequency: this.state.frequency,
                    onRangeChange: this.onPaginatorChange.bind(this),
                    onFrequencyChange: function (value) {
                        return _this.setState({ frequency: value, start: 0 });
                    },
                    pickerOnShow: this.props.onFocusItem,
                    pickerOnDismiss: this.props.onBlurItem
                }),
                React.createElement(
                    'h4',
                    null,
                    this.props.title
                ),
                React.createElement(
                    'div',
                    { style: { margin: 16, maxHeight: 210 } },
                    React.createElement(_graphRemoteGraphLine2['default'], {
                        ref: 'chart',
                        queryName: this.props.queryName,
                        frequency: this.state.frequency,
                        filters: filters,
                        colorIndex: 2,
                        start: this.state.start,
                        onDataLoaded: this.onGraphDataLoaded.bind(this),
                        width: containerW - 40,
                        height: containerH - 90
                    })
                )
            );
        }
    }]);

    return GraphCard;
})(Component);

GraphCard.displayName = 'GraphCard';

GraphCard.propTypes = {
    queryName: PropTypes.string,
    title: PropTypes.string,
    defaultInterval: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string,
    zDepth: PropTypes.number
};

GraphCard.defaultProps = {
    style: {
        width: 540, height: 350, zDepth: 1
    }
};

var globalMessages = global.pydio.MessageHash;

var gridData = {
    gridDimension: {
        gridWidth: 4,
        gridHeight: 20
    },
    builderDisplayName: globalMessages['ajxp_admin.home.20'],
    builderFields: [{ name: 'title', label: globalMessages['ajxp_admin.home.30'], type: 'string', mandatory: true }, { name: 'queryName',
        label: globalMessages['ajxp_admin.home.21'],
        type: 'select',
        choices: '' + 'uploads_per_day|' + globalMessages['ajxp_admin.home.22'] + ',' + 'downloads_per_day|' + globalMessages['ajxp_admin.home.23'] + ',' + 'sharedfiles_per_day|' + globalMessages['ajxp_admin.home.24'] + ',' + 'connections_per_day|' + globalMessages['ajxp_admin.home.25']
    }, { name: 'workspaceFilter', label: globalMessages['ajxp_admin.home.69'], type: 'select', choices: 'AJXP_AVAILABLE_REPOSITORIES', description: globalMessages['ajxp_admin.home.70'] }, { name: 'filenameFilter', label: globalMessages['ajxp_admin.home.71'], description: globalMessages['ajxp_admin.home.72'], type: 'string' }, { name: 'interval', label: globalMessages['ajxp_admin.home.18'], type: 'integer', 'default': 300 }]
};

exports['default'] = GraphCard = (0, _utilReloadWrapper2['default'])(GraphCard);
exports['default'] = GraphCard = asGridItem(GraphCard, gridData.builderDisplayName, gridData.gridDimension, gridData.builderFields);
exports['default'] = GraphCard;
module.exports = exports['default'];
