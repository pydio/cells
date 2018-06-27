'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var Paper = _require2.Paper;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;
var LabelWithTip = _require$requireLib.LabelWithTip;

var PathUtils = require('pydio/util/path');

var MostActiveBadge = (function (_Component) {
    _inherits(MostActiveBadge, _Component);

    function MostActiveBadge(props, context) {
        _classCallCheck(this, MostActiveBadge);

        _get(Object.getPrototypeOf(MostActiveBadge.prototype), 'constructor', this).call(this, props, context);
        this.state = { figure: this.props.figure || '-' };
    }

    _createClass(MostActiveBadge, [{
        key: 'loadStatus',
        value: function loadStatus() {
            var _props = this.props;
            var type = _props.type;
            var range = _props.range;
            var actionName = _props.actionName;
            var workspaceFilter = _props.workspaceFilter;
            var filenameFilter = _props.filenameFilter;

            this.firstLoad = null;
            var params = {
                get_action: 'most_active_type',
                type: type || 'user',
                date_range: range || 'last_day'
            };
            if (type === "action" && actionName) {
                params["action"] = actionName;
            }
            if (workspaceFilter && workspaceFilter != -1) {
                params["ws_id"] = workspaceFilter;
            }
            if (filenameFilter) {
                params["filename_filter"] = filenameFilter;
            }

            PydioApi.getClient().request(params, (function (transport) {
                var data = transport.responseJSON;
                if (data.ERROR || !data.DATA || !data.DATA.length) return;
                var figure = data.DATA[0]['Object'];
                var additionalData = undefined;
                if (data.USERS && data.USERS['AJXP_USR_/' + figure]) {
                    try {
                        additionalData = figure;
                        figure = data.USERS['AJXP_USR_/' + figure]['AJXP_REPO_SCOPE_ALL']['core.conf']['USER_DISPLAY_NAME'];
                    } catch (e) {}
                }
                if (type === "action" && figure.indexOf("/") !== -1) {
                    additionalData = figure;
                    figure = PathUtils.getBasename(figure);
                }
                this.setState({ figure: figure, additionalData: additionalData });
            }).bind(this), null, { discrete: true });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.firstLoad = global.setTimeout(this.loadStatus.bind(this), 500);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.firstLoad) {
                global.clearTimeout(this.firstLoad);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var className = (this.props.className ? this.props.className + ' ' : '') + 'graphs-badge most-active-badge';
            var labelElement = React.createElement(
                'h4',
                { className: 'figure text ellipsis-label' },
                this.state.figure
            );
            return React.createElement(
                Paper,
                _extends({}, this.props, {
                    zDepth: 1,
                    className: className,
                    transitionEnabled: false
                }),
                this.props.buttons,
                React.createElement(
                    'div',
                    { className: 'badge-content' },
                    React.createElement(LabelWithTip, { labelElement: labelElement, tooltip: this.state.additionalData }),
                    React.createElement(
                        'div',
                        { className: 'legend' },
                        this.props.legend
                    )
                )
            );
        }
    }]);

    return MostActiveBadge;
})(Component);

MostActiveBadge.propTypes = {
    type: PropTypes.oneOf(['user', 'ip', 'action']),
    figure: PropTypes.number,
    range: PropTypes.string,
    legend: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    actionName: PropTypes.string,
    workspaceFilter: PropTypes.string,
    filenameFilter: PropTypes.string
};

var globalMessages = global.pydio.MessageHash;
var gridData = {
    gridDimension: {
        gridWidth: 2,
        gridHeight: 6
    },
    builderDisplayName: globalMessages['ajxp_admin.home.7'],
    builderFields: [{ name: 'legend', label: globalMessages['ajxp_admin.home.12'], type: 'string', mandatory: true }, { name: 'range', label: globalMessages['ajxp_admin.home.13'],
        type: 'select',
        choices: '' + 'last_day|' + globalMessages['ajxp_admin.home.14'] + ',' + 'last_week|' + globalMessages['ajxp_admin.home.15'] + ',' + 'last_month|' + globalMessages['ajxp_admin.home.16'],
        mandatory: true,
        'default': 'last_day'
    }, { name: 'type',
        label: globalMessages['ajxp_admin.home.8'],
        type: 'select',
        choices: '' + 'user|' + globalMessages['ajxp_admin.home.9'] + ',' + 'ip|' + globalMessages['ajxp_admin.home.10'] + ',' + 'action|' + globalMessages['ajxp_admin.home.11'],
        'default': 'user',
        mandatory: true
    }, { name: 'actionName', label: globalMessages['ajxp_admin.home.17'], type: 'select', choices: 'json_list:list_query_actions', description: globalMessages['ajxp_admin.home.73'] }, { name: 'workspaceFilter', label: globalMessages['ajxp_admin.home.69'], type: 'select', choices: 'AJXP_AVAILABLE_REPOSITORIES', description: globalMessages['ajxp_admin.home.70'] }, { name: 'filenameFilter', label: globalMessages['ajxp_admin.home.71'], description: globalMessages['ajxp_admin.home.72'], type: 'string' }, { name: 'interval', label: globalMessages['ajxp_admin.home.18'], type: 'integer', 'default': 300 }]

};

exports['default'] = MostActiveBadge = asGridItem(MostActiveBadge, gridData.builderDisplayName, gridData.gridDimension, gridData.builderFields);
exports['default'] = MostActiveBadge;
module.exports = exports['default'];
