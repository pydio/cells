'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMixins = require("../util/Mixins");

var RichLogsList = _react2['default'].createClass({
    displayName: 'RichLogsList',

    mixins: [_utilMixins.MessagesConsumerMixin],

    propTypes: {
        remoteFilter: _react2['default'].PropTypes.object,
        localFilter: _react2['default'].PropTypes.object,
        dateRange: _react2['default'].PropTypes.string,
        limit: _react2['default'].PropTypes.number
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dateRange: 'last_day',
            limit: 30
        };
    },

    getInitialState: function getInitialState() {
        return { logs: [] };
    },

    parseLogs: function parseLogs(jsonResponse) {
        var logs = jsonResponse['LOGS'];
        var users = jsonResponse['USERS'];
        var workspaces = jsonResponse['WORKSPACES'];
        var data = logs.map((function (log) {
            if (log['logdate'] instanceof Object) {
                log['date'] = log['logdate']['date'];
            } else {
                log['date'] = log['logdate'];
            }
            try {
                var u = users[log['user']];
                var uLabel = u['AJXP_REPO_SCOPE_ALL']['core.conf']['USER_DISPLAY_NAME'];
                if (uLabel) {
                    log['user_label'] = uLabel;
                }
            } catch (e) {}
            if (log['repository_id'] && workspaces && workspaces[log['repository_id']]) {
                log['repository_label'] = workspaces[log['repository_id']];
            }
            return log;
        }).bind(this));
        if (!data.length) {
            data.push({ message: this.context.getMessage('home.31', 'ajxp_admin'), readable_date: '', severity: '' });
        }
        this.setState({ logs: data });
    },

    loadLogs: function loadLogs() {
        this.firstLoad = null;
        var params = {
            get_action: 'rich_logs_list',
            /*date_range:this.props.dateRange,*/
            limit: this.props.limit
        };
        if (this.props.remoteFilter) {
            params = LangUtils.objectMerge(params, this.props.remoteFilter);
        }
        PydioApi.getClient().request(params, (function (transport) {
            if (!this.isMounted()) return;
            this.parseLogs(transport.responseJSON);
        }).bind(this));
    },

    componentDidMount: function componentDidMount() {
        this.firstLoad = setTimeout(this.loadLogs, 500);
    },

    componentWillUnmount: function componentWillUnmount() {
        if (this.firstLoad) {
            clearTimeout(this.firstLoad);
        }
    },

    render: function render() {

        var index = 0;
        var logs = this.state.logs.map((function (log) {
            if (log.params == "context=API") return null;
            if (this.props.localFilter) {
                for (var key in log) {
                    if (log.hasOwnProperty(key)) {
                        if (this.props.localFilter[key]) {
                            var testValues = this.props.localFilter[key].split('|');
                            if (testValues.indexOf(log[key]) === -1) {
                                return null;
                            }
                        }
                    }
                }
            }
            index++;
            var logIcon;
            if (log.severity == 'ERROR') {
                logIcon = _react2['default'].createElement('span', { className: 'icon-warning-sign' });
            }
            var secondMeta = _react2['default'].createElement(
                'span',
                { className: 'log-user' },
                log.user_label ? log.user_label : log.user
            );
            if (this.props.remoteFilter && this.props.remoteFilter['user']) {
                if (log.repository_id) {
                    secondMeta = _react2['default'].createElement(
                        'span',
                        { className: 'log-user' },
                        log.repository_label ? log.repository_label : this.context.getMessage('79', 'ajxp_conf') + ' ' + log.repository_id
                    );
                } else {
                    secondMeta = null;
                }
            }
            return _react2['default'].createElement(
                'div',
                { key: index, className: "log log-" + log.severity, title: log.params },
                _react2['default'].createElement(
                    'div',
                    { className: 'log-title' },
                    _react2['default'].createElement(
                        'span',
                        { className: 'log-date' },
                        logIcon,
                        ' ',
                        log['readable_date'] ? log['readable_date'] : this.props.dateRange == 'last_day' ? log.date.split(' ').pop() : log.date
                    ),
                    _react2['default'].createElement(
                        'span',
                        { className: 'log-action' },
                        log.message
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'log-meta' },
                    secondMeta
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'log-data' },
                    _react2['default'].createElement(
                        'span',
                        { className: 'log-params' },
                        log.params ? log.params : ''
                    )
                )
            );
        }).bind(this));

        return _react2['default'].createElement(
            'div',
            { className: (this.props.className ? this.props.className : '') + ' recent-logs' },
            logs,
            _react2['default'].createElement(
                'div',
                { style: { textAlign: 'center', padding: 16 } },
                _react2['default'].createElement(_materialUi.FlatButton, {
                    secondary: true,
                    onTouchTap: function () {
                        global.pydio.goTo('/admin/logs');
                    },
                    label: this.context.getMessage('home.74', 'ajxp_admin')
                })
            )
        );
    }

});

exports['default'] = RichLogsList;
module.exports = exports['default'];
