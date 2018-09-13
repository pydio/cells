import React from 'react'
import {Paper} from 'material-ui'
import {Doughnut} from 'react-chartjs'
import PydioApi from 'pydio/http/api'
import Pydio from 'pydio'
import ResourcesManager from 'pydio/http/resources-manager'
const {moment} = Pydio.requireLib('boot');

class AboutPanel extends React.Component{

    constructor(props){
        super(props);
        this.state = {content: ''};
    }

    componentDidMount(){
        if(this.state.content) {
            return;
        }
        // TODO : LOAD COPYRIGHT
    }

    render(){

        let setContent = function(){
            const c = '<u>Pydio Enterprise Distribution</u> is covered by an <a href="plug/boot.enterprise/EULA.txt" target="_blank">End-User License Agreement</a> that you have agreed when installing the software.<br/>' + this.state.content;
            return {__html:c};
        }.bind(this);

        return (
            <div style={{padding:'0 20px', overflow:'auto', height: '100%'}}>
                <h3>Open Source Credits</h3>
                <div className="pydio-oss-credits" dangerouslySetInnerHTML={setContent()}></div>
            </div>
        );
    }
}

class Dashboard extends React.Component {

    constructor(props){
        super(props);
        this.state = {certLicense: {}};
    }

    load() {
        // Load and trigger callback
        ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
            const api = new sdk.LicenseServiceApi(PydioApi.getRestClient());
            api.licenseStats(false).then(res => {
                this.setState({certLicense: res})
            });
        });
    }

    componentDidMount(){
        this.load();
    }

    getMessage(id){
        const {pydio} = this.props;
        return pydio.MessageHash['license.' + id] || id;
    }

    render(){

        let additionalPane;
        const {certLicense} = this.state;

        if(certLicense.License){

            const activeUsers = parseInt(certLicense.ActiveUsers);
            const maxUsers = parseInt(certLicense.License.MaxUsers);
            const expireTime = certLicense.License.ExpireTime;
            const nowTime = Math.floor(new Date() / 1000);
            const expireDate = new Date(expireTime * 1000);

            const usersData = [
                {
                    value: activeUsers,
                    color:"rgba(247, 70, 74, 0.51)",
                    highlight: "#FF5A5E",
                    label: this.getMessage('1')
                },
                {
                    value: Math.max(0, maxUsers - activeUsers),
                    color: "rgba(70, 191, 189, 0.59)",
                    highlight: "#5AD3D1",
                    label: this.getMessage('3')
                }
            ];

            const isTrial = false;
            const isInvalid = false;
            const isExpired = expireTime < nowTime;
            const usersReached = activeUsers >= maxUsers;

            let licenseStatus, licenseStats;
            let statusMessage = "5", statusIcon = "ok";
            if(isExpired){
                statusMessage = "14";
                statusIcon = "warning";
            }else if(usersReached){
                statusMessage = "15";
                statusIcon = "warning";
            }else if(isInvalid){
                statusMessage = "6";
                statusIcon = "warning";
            }else if(isTrial){
                statusMessage = "12";
                statusIcon = "ok";
            }

            licenseStatus = <h3>{this.getMessage('4')}: <span className={"icon-"+statusIcon+"-sign"}></span> {this.getMessage(statusMessage)}</h3>;
            if(isInvalid){
                licenseStats = (
                    <div>{this.getMessage('13')}</div>
                );
            }else{
                licenseStats = (
                    <div>
                        <div className="doughnut-chart">
                            <h5>{this.getMessage('7')} <b>{moment(expireDate).fromNow()}</b>.</h5>
                            <Doughnut
                                data={usersData}
                                options={{}}
                                width={200}
                            />
                            <span className="figure">{Math.round(activeUsers / maxUsers * 100) + '%'}</span>
                        </div>
                    </div>
                );
            }

            additionalPane = (
                <div style={{padding:'0 20px'}}>
                    {licenseStatus}
                    {licenseStats}
                </div>
            );
        }else{
            additionalPane = (
                <div style={{padding:20}}>
                    <h3>{this.getMessage('4')}</h3>
                    <div> ... </div>
                </div>
            );
        }

        return (
            <div className={"main-layout-nav-to-stack vertical-layout plugin-board"} style={this.props.style}>
                <AdminComponents.Header title={"Pydio Enterprise License"} icon={"mdi mdi-certificate"}/>
                <div style={{display:'flex'}}>
                    <Paper zDepth={1} style={{margin: 10, flex: 1}}>{additionalPane}</Paper>
                    <Paper zDepth={1} style={{margin: 10, flex: 1}}><AboutPanel/></Paper>
                </div>
            </div>
        );
    }

}

export {Dashboard as default}