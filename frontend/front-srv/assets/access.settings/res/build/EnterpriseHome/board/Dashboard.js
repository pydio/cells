'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var Dashboard = React.createClass({
    displayName: 'Dashboard',

    getDefaultCards: function getDefaultCards() {

        var getMessageFunc = this.props.getMessage;

        return [{
            id: 'welcome_panel',
            componentClass: 'EnterpriseHome.WelcomePanel',
            props: {},
            defaultPosition: {
                x: 0, y: 0
            }
        }, {
            id: 'quick_links',
            componentClass: 'EnterpriseHome.QuickLinks',
            props: {},
            defaultPosition: {
                x: 0, y: 0
            }
        }, {
            id: 'connections_today',
            componentClass: 'EnterpriseHome.GraphBadge',
            props: {
                queryName: "connections_per_day",
                legend: getMessageFunc('home.57'),
                interval: 60
            },
            defaultPosition: {
                x: 0, y: 1
            }
        }, {
            id: 'downloads_today',
            componentClass: 'EnterpriseHome.GraphBadge',
            props: {
                queryName: "downloads_per_day",
                legend: getMessageFunc('home.58'),
                interval: 60
            },
            defaultPosition: {
                x: 2, y: 1
            }
        }, {
            id: 'uploads_this_week',
            componentClass: 'EnterpriseHome.GraphBadge',
            props: {
                queryName: "uploads_per_day",
                legend: getMessageFunc('home.59'),
                frequency: "week",
                interval: 60
            },
            defaultPosition: {
                x: 4, y: 1
            }
        }, {
            id: 'sharedfiles_per_today',
            componentClass: 'EnterpriseHome.GraphBadge',
            props: {
                queryName: "sharedfiles_per_day",
                legend: getMessageFunc('home.60'),
                interval: 60
            },
            defaultPosition: {
                x: 6, y: 1
            }
        }, {
            id: 'most_active_user_today',
            componentClass: 'EnterpriseHome.MostActiveBadge',
            props: {
                type: "user",
                legend: getMessageFunc('home.61'),
                range: "last_day"
            },
            defaultPosition: {
                x: 0, y: 6
            }
        }, {
            id: 'most_active_ip_last_week',
            componentClass: 'EnterpriseHome.MostActiveBadge',
            props: {
                type: "ip",
                legend: getMessageFunc('home.62'),
                range: "last_week"
            },
            defaultPosition: {
                x: 2, y: 6
            }
        }, {
            id: 'most_downloaded_last_week',
            componentClass: 'EnterpriseHome.MostActiveBadge',
            props: {
                type: "action",
                legend: getMessageFunc('home.63'),
                range: "last_week",
                actionName: "download"
            },
            defaultPosition: {
                x: 4, y: 6
            }
        }, {
            id: 'most_previewed_last_week',
            componentClass: 'EnterpriseHome.MostActiveBadge',
            props: {
                type: "action",
                legend: getMessageFunc('home.64'),
                range: "last_week",
                actionName: "preview"
            },
            defaultPosition: {
                x: 6, y: 6
            }
        }, {
            id: 'files_activity',
            componentClass: 'EnterpriseHome.GraphCard',
            props: {
                title: getMessageFunc('home.65'),
                queryName: "uploads_per_day,downloads_per_day,sharedfiles_per_day",
                interval: 60
            },
            defaultPosition: {
                x: 0, y: 12
            }
        }, {
            id: 'webconnections_graph',
            componentClass: 'EnterpriseHome.GraphCard',
            props: {
                title: getMessageFunc('home.66'),
                queryName: "connections_per_day",
                interval: 60
            },
            defaultPosition: {
                x: 4, y: 12
            }
        }, {
            id: 'recent_logs',
            componentClass: 'EnterpriseHome.RecentLogs',
            props: {
                interval: 20
            },
            defaultPosition: {
                x: 0, y: 26
            }
        }, {
            id: 'server_status',
            componentClass: 'EnterpriseHome.ServerStatus',
            props: {
                interval: 10
            },
            defaultPosition: {
                x: 3, y: 26
            }
        }];
    },

    render: function render() {

        return React.createElement(PydioComponents.DynamicGrid, {
            storeNamespace: 'EnterpriseHome.Dashboard',
            builderNamespaces: ['EnterpriseHome', 'EnterprisePlugins'],
            defaultCards: this.getDefaultCards(),
            pydio: this.props.pydio,
            style: { height: '100%' },
            rglStyle: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }
        });
    }

});

exports['default'] = Dashboard = PydioReactUI.PydioContextConsumer(Dashboard);
exports['default'] = Dashboard;
module.exports = exports['default'];
