import React from 'react'
import SimpleDashboard from './SimpleDashboard'
import AdvancedDashboard from './AdvancedDashboard'
import Header from './Header'
import ResourcesManager from 'pydio/http/resources-manager'

class TabBoard extends React.Component {

    constructor(props){
        super(props);
        this.state = {tab: 'dashboard'};
    }

    onTabChange(value){
        if (value === 'dashboard'){
            this.setState({tab: value});
        } else if(value === 'audit') {
            // Load
            ResourcesManager.loadClassesAndApply(['AdminLogs'], () => {
                this.setState({tab: 'audit'});
            });
        }
    }

    handleLogToolsChange(state){
        this.setState({logToolsState: state});
    }

    handleLoadingStatusChange(status){
        this.setState({logsLoading: status});
    }

    render(){

        const {tab, logToolsState} = this.state;
        const {pydio} = this.props;

        const tabs = [
            {Value: 'dashboard', Label: pydio.MessageHash['ajxp_admin.dashboard.tab.dashboard'], Icon:'mdi mdi-view-dashboard'},
            {Value: 'audit', Label: pydio.MessageHash['ajxp_admin.dashboard.tab.activity'], Icon: 'mdi mdi-pulse'},
        ];
        let buttons = [];
        if(tab === 'audit'){
            buttons.push(<AdminLogs.LogTools pydio={pydio} service={'audit'} onStateChange={this.handleLogToolsChange.bind(this)}/>);
        }

        let mainContent;
        if(tab === 'dashboard'){
            //mainContent = <SimpleDashboard {...this.props}/>
            mainContent = <AdvancedDashboard {...this.props}/>

        } else if(tab === 'audit'){
            mainContent = (
                <AdminLogs.Dashboard ref="logBoard" {...this.props} {...logToolsState} noHeader={true} service={'audit'} onLoadingStatusChange={this.handleLoadingStatusChange.bind(this)}/>
            );
        }

        return (
            <div className="main-layout-nav-to-stack vertical-layout workspaces-board">
                <div className="vertical-layout layout-fill" style={{width:'100%'}}>
                    <Header
                        tabs={tabs}
                        onTabChange={this.onTabChange.bind(this)}
                        tabValue={tab}
                        actions={buttons}
                        reloadAction={tab==='audit'?() => {this.refs.logBoard.handleReload()}:undefined}
                        loading={this.state.logsLoading}
                    />
                    <div className="layout-fill">{mainContent}</div>
                </div>
            </div>
        );
    }

}

export {TabBoard as default}