/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import React from 'react'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import {UpdateServiceApi, UpdateUpdateRequest, UpdateApplyUpdateRequest} from 'pydio/http/rest-api'
import {muiThemeable} from 'material-ui/styles'
import {Dialog, FlatButton, RaisedButton, FontIcon, Card, CardHeader, CardMedia, CardTitle, List, ListItem, Divider,
    CardActions, Checkbox, TextField, CircularProgress} from 'material-ui'
import Markdown from 'react-markdown'
const {moment, SingleJobProgress} = Pydio.requireLib('boot');
import {EnterpriseDistEULA} from "./UpgraderResources";

const Styles = {
    body:{
        padding: 20,
        color:'#424242',
        fontSize: 13,
        minHeight: 240
    },
};

class UpgraderWizard extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            step:'ad',
            acceptEula: false,
            licenseKey: null,
            versionLoading: false,
            versionAvailable: false,
            versionsNoMatch:[],
            versionError: null,
            watchJob: null,
            upgradePerformed: false
        };
        // TODO REMOVE THIS IS FOR DEBUGGING
        this.state = {
            step:'ad',
            acceptEula: true,
            licenseKey: "A LICENSE KEY HERE",
            versionAvailable: false,
            upgradePerformed: false
        }
    }

    dismiss(){
        this.props.onDismiss();
        this.setState({
            step:'ad',
            acceptEula: false,
            licenseKey: null,
            versionLoading: false,
            versionAvailable: false,
            versionError: null,
            watchJob: null,
            upgradePerformed: false,
        });
    }

    next(step){
        this.setState({step: step});
        if(step === "check"){
            const {licenseKey} = this.state;
            this.findVersion(licenseKey);
        } else if(step === "perform"){
            const {versionAvailable} = this.state;
            this.applyUpgrade(versionAvailable.Version);
        }
    }

    findVersion(licenseKey){
        const {currentVersion} = this.props;
        const api = new UpdateServiceApi(PydioApi.getRestClient());
        const request = new UpdateUpdateRequest();
        request.PackageName = "PydioEnterprise";
        request.LicenseInfo = {Key:licenseKey, Save:"true"};
        Pydio.startLoading();
        this.setState({versionLoading: true});
        api.updateRequired(request).then(res => {
            Pydio.endLoading();
            if (res.AvailableBinaries) {
                const noMatches = [];
                res.AvailableBinaries.forEach(bin => {
                    if(currentVersion === bin.Version){
                        this.setState({versionAvailable: bin});
                    } else {
                        noMatches.push(bin);
                    }
                });
                this.setState({versionsNoMatch: noMatches});
            }
            this.setState({versionLoading: false});
        }).catch((e) => {
            Pydio.endLoading();
            this.setState({versionLoading: false, versionError: e.message});
        });
    }

    applyUpgrade(version) {
        const api = new UpdateServiceApi(PydioApi.getRestClient());
        const req = new UpdateApplyUpdateRequest();
        req.PackageName = "PydioEnterprise";
        req.TargetVersion = version;
        api.applyUpdate(version, req).then(res => {
            if (res.Success) {
                this.setState({watchJob: res.Message});
            } else {
                pydio.UI.displayMessage('ERROR', res.Message);
            }
        }).catch(()=>{

        });
    }

    upgradeFinished(){

    }

    render(){
        const {step, upgradePerformed} = this.state;
        const {open} = this.props;
        const cardMessage = (id) => {return pydio.MessageHash['admin_dashboard.' + id]};
        const {accent2Color} = this.props.muiTheme.palette;

        let content, actions;
        let title = "Upgrade to Cells Enterprise";
        switch (step) {
            case "ad":

                title = undefined;
                content = (
                    <Card style={{width:'100%'}} zDepth={0}>
                        <CardMedia
                            overlay={<CardTitle title={cardMessage('ent.title')} subtitle={cardMessage('ent.subtitle')}/>}
                        >
                            <div style={{height:230, backgroundImage:'url(plug/access.settings/res/images/dashboard.png)', backgroundSize:'cover',borderRadius:0}}/>
                        </CardMedia>
                        <List>
                            <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-certificate"/>} primaryText={cardMessage('ent.features')} secondaryText={cardMessage('ent.features.legend')} />
                            <Divider/>
                            <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-chart-areaspline"/>} primaryText={cardMessage('ent.advanced')} secondaryText={cardMessage('ent.advanced.legend')} />
                            <Divider/>
                            <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-message-alert"/>} primaryText={cardMessage('ent.support')} secondaryText={cardMessage('ent.support.legend')} />
                        </List>
                    </Card>
                );
                actions = [
                    <FlatButton style={{float:'left'}} label={cardMessage('ent.btn.more')} onTouchTap={()=>{window.open('https://pydio.com/en/features/pydio-cells-overview')}} />,
                    <FlatButton onTouchTap={()=>this.dismiss()} label={"Cancel"} primary={false}/>,
                    <RaisedButton onTouchTap={()=>{this.next('eula')}} label={"Start"} primary={true}/>
                ];
                break;

            case "eula":

                const {acceptEula} = this.state;
                content = (
                    <div style={Styles.body}>
                        <h5>1. Please Accept End-User License Agreement</h5>
                        <Markdown source={EnterpriseDistEULA}/>
                        <Checkbox label={"I thereby accept this EULA"} checked={acceptEula} onCheck={(e,v)=>{this.setState({acceptEula: v})}}/>
                    </div>
                );
                actions = [
                    <FlatButton onTouchTap={()=>this.dismiss()} label={"Cancel"} primary={false}/>,
                    <FlatButton onTouchTap={()=>{this.next('license')}} label={"Next"} primary={true} disabled={!acceptEula}/>
                ];
                break;

            case "license":

                const {licenseKey} = this.state;
                content = (
                    <div style={Styles.body}>
                        <h5>2. Enter a valid license key (provided by a Pydio sales representative).</h5>
                        <div>If you do not own one, you can receive a trial key by contacting sales using the
                            button below or directly via <a href={"mailto:services@pydio.com"}>services@pydio.com</a>
                        </div>
                        <TextField
                            value={licenseKey}
                            onChange={(e,v)=>{this.setState({licenseKey: v})}}
                            floatingLabelText={"Paste key here..."}
                            floatingLabelFixed={true}
                            multiLine={true}
                            rowsMax={16}
                            rows={10}
                            fullWidth={true}
                        />
                    </div>
                );
                actions = [
                    <FlatButton style={{float:'left'}} label={cardMessage('ent.btn.contact')} onTouchTap={()=>{window.open('https://pydio.com/en/pricing/contact')}} secondary={true}/>,
                    <FlatButton onTouchTap={()=>this.dismiss()} label={"Cancel"} primary={false}/>,
                    <FlatButton onTouchTap={()=>{this.next('check')}} label={"Next"} primary={true} disabled={!licenseKey}/>
                ];
                break;

            case "check":

                const {versionLoading, versionAvailable, versionsNoMatch, versionError} = this.state;
                content = (
                    <div style={Styles.body}>
                        {versionLoading &&
                            <div>
                                <h5>3. Looking for the closest Cells Enterprise version</h5>
                                <div style={{display:'flex', width: '100%', height: 320, alignItems:'center', justifyContent:'center'}}><CircularProgress/></div>
                            </div>
                        }
                        {versionError &&
                            <div>
                                <h5>3. Cannot load available versions for Cells Enterprise!</h5>
                                <div>Error was: {versionError}</div>
                            </div>
                        }
                        {versionAvailable &&
                            <div>
                                <h5>3. Ready to install {versionAvailable.Label}!</h5>
                                <div style={{backgroundColor: '#ECEFF1', padding: 16, borderRadius: 2, marginBottom: 20}}>
                                    <u>Released</u>: {new Date(versionAvailable.ReleaseDate * 1000).toISOString()}<br/>
                                    <u>Architecture</u>: {versionAvailable.BinaryOS} - {versionAvailable.BinaryArch}<br/>
                                    <u>Description</u>: {versionAvailable.Description}<br/>
                                </div>
                                <p>
                                    Hitting Next will now download this new version and replace your current Cells binary.
                                    A backup of the original executable will be made inside your cells config folder
                                    (under CELLS_CONFIG/services/pydio.grpc.update), if you need to recover it.
                                </p>
                            </div>
                        }
                        {!versionAvailable && versionsNoMatch && versionsNoMatch.length > 0 &&
                            <div>
                                <h5>3. Could not find a similar version for Cells Enterprise!</h5>
                                <div>
                                    To avoid mixing upgrade and updates, we recommend upgrading Cells Home to Enterprise on the same version.
                                    <br/>
                                    Please first update your current version to one of the following, then retry upgrading to Cells Enterprise.
                                    <ul>
                                    {versionsNoMatch.map(bin => {
                                        return <li>&gt; {bin.Version}</li>
                                    })}
                                    </ul>
                                </div>
                            </div>
                        }
                    </div>
                );
                actions = [
                    <FlatButton onTouchTap={()=>this.dismiss()} label={"Cancel"} primary={false}/>,
                    <FlatButton onTouchTap={()=>{this.next('perform')}} label={"Next"} primary={true} disabled={!versionAvailable}/>
                ];
                break;

            case "perform":

                const {watchJob} = this.state;
                if(watchJob) {
                    content = (
                        <div style={Styles.body}>
                            <SingleJobProgress
                                jobID={watchJob}
                                progressStyle={{paddingTop: 16}}
                                lineStyle={{userSelect:'text'}}
                                onEnd={()=>{this.upgradeFinished()}}
                            />
                        </div>
                    );
                } else {
                    content = (
                        <div style={Styles.body}>Launching upgrade please wait...</div>
                    )
                }

                actions = [
                    <FlatButton onTouchTap={()=>this.dismiss()} label={"Close"} primary={true}/>,
                ];
                break;

            default:
                break;
        }

        return (
            <Dialog
                title={title}
                bodyStyle={{padding:0}}
                autoScrollBodyContent={true}
                modal={true}
                open={open}
                actions={actions}
            >{content}</Dialog>
        )
    }
}

UpgraderWizard = muiThemeable()(UpgraderWizard);
export {UpgraderWizard as default}