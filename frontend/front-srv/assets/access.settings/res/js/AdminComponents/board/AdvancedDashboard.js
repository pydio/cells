import React from 'react'
import Pydio from 'pydio'
const {DynamicGrid} = Pydio.requireLib('components');
const {PydioContextConsumer} = Pydio.requireLib('boot');

class AdvancedDashboard extends React.Component{

    getDefaultCards(){

        const getMessageFunc = this.props.getMessage;

        return [
            /*
            {
                id:'welcome_panel',
                componentClass:'AdminComponents.WelcomePanel',
                props:{},
                defaultPosition:{
                    x:0, y:0
                }
            },
            */
            {
                id:'quick_links',
                componentClass:'AdminComponents.QuickLinks',
                props:{},
                defaultPosition:{
                    x:0, y:0
                }
            },
            {
                id:'connections_today',
                componentClass:'AdminComponents.GraphBadge',
                props:{
                    queryName:"LoginSuccess",
                    legend:getMessageFunc('home.57'),
                    frequency:"D",
                    interval:60
                },
                defaultPosition:{
                    x:0, y:1
                }
            },
            {
                id:'downloads_today',
                componentClass:'AdminComponents.GraphBadge',
                props:{
                    queryName:"ObjectGet",
                    legend:getMessageFunc('home.58'),
                    frequency:"D",
                    interval:60
                },
                defaultPosition:{
                    x:2, y:1
                }
            },
            {
                id:'uploads_this_week',
                componentClass:'AdminComponents.GraphBadge',
                props:{
                    queryName:"ObjectPut",
                    legend:getMessageFunc('home.59'),
                    frequency:"D",
                    interval:60
                },
                defaultPosition:{
                    x:4, y:1
                }
            },
            {
                id:'sharedfiles_per_today',
                componentClass:'AdminComponents.GraphBadge',
                props:{
                    queryName:"LoginFailed",
                    legend:getMessageFunc('home.60'),
                    frequency:"D",
                    interval:60
                },
                defaultPosition:{
                    x:6, y:1
                }
            },
            /*
            {
                id:'most_active_user_today',
                componentClass:'AdminComponents.MostActiveBadge',
                props:{
                    type:"user",
                    legend:getMessageFunc('home.61'),
                    range:"last_day"
                },
                defaultPosition:{
                    x:0, y:6
                }
            },
            {
                id:'most_active_ip_last_week',
                componentClass:'AdminComponents.MostActiveBadge',
                props:{
                    type:"ip",
                    legend:getMessageFunc('home.62'),
                    range:"last_week"
                },
                defaultPosition:{
                    x:2, y:6
                }
            },
            {
                id:'most_downloaded_last_week',
                componentClass:'AdminComponents.MostActiveBadge',
                props:{
                    type:"action",
                    legend:getMessageFunc('home.63'),
                    range:"last_week",
                    actionName:"download"
                },
                defaultPosition:{
                    x:4, y:6
                }
            },
            {
                id:'most_previewed_last_week',
                componentClass:'AdminComponents.MostActiveBadge',
                props:{
                    type:"action",
                    legend:getMessageFunc('home.64'),
                    range:"last_week",
                    actionName:"preview"
                },
                defaultPosition:{
                    x:6, y:6
                }
            },
            */
            {
                id:'files_activity',
                componentClass:'AdminComponents.GraphCard',
                props:{
                    title:getMessageFunc('home.65'),
                    queryName:"ObjectGet",
                    frequency:"H",
                    interval:60
                },
                defaultPosition:{
                    x:0, y:12
                }
            },
            {
                id:'webconnections_graph',
                componentClass:'AdminComponents.GraphCard',
                props:{
                    title:getMessageFunc('home.66'),
                    queryName:"LoginSuccess",
                    frequency:"H",
                    interval:60
                },
                defaultPosition:{
                    x:4, y:12
                }
            },
            {
                id:'recent_logs',
                componentClass:'AdminComponents.RecentLogs',
                props:{
                    interval:60
                },
                defaultPosition:{
                    x:0, y:26
                }
            },
            {
                id:'services_status',
                componentClass:'AdminComponents.ServicesStatus',
                props:{
                    interval:120
                },
                defaultPosition:{
                    x:3, y:26
                }
            },
            {
                id:'todo_list',
                componentClass:'AdminComponents.ToDoList',
                defaultPosition:{
                    x:6, y:26
                }
            }
        ];
    }

    render(){

        return (
            <DynamicGrid
                storeNamespace="AdminHome.AdvancedDashboard"
                builderNamespaces={['AdminComponents']}
                defaultCards={this.getDefaultCards()}
                pydio={this.props.pydio}
                style={{height: '100%'}}
                rglStyle={{position:'absolute', top: 6, left: 6, right: 6, bottom: 6}}
                disableEdit={true}
            />
        )

    }

}

AdvancedDashboard = PydioContextConsumer(AdvancedDashboard);
export {AdvancedDashboard as default}