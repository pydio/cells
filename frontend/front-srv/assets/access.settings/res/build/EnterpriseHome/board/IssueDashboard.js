'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var IssueDashboard = React.createClass({
    displayName: 'IssueDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    render: function render() {

        var issueMessage = pydio.getContextHolder().getRootNode().getMetadata().get("dashboard_issue");

        return React.createElement(
            'div',
            { style: { width: '100%', height: '100%' } },
            React.createElement(
                ReactMUI.Paper,
                { zDepth: 1, style: { margin: 10 } },
                React.createElement(
                    'div',
                    { style: { padding: 10 } },
                    React.createElement('span', { className: 'icon-warning-sign' }),
                    ' ',
                    issueMessage
                )
            )
        );
    }

});

exports['default'] = IssueDashboard;
module.exports = exports['default'];
