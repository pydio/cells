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
import {UpdateServiceApi, UpdateUpdateRequest, UpdateApplyUpdateRequest} from 'cells-sdk'

import {muiThemeable} from 'material-ui/styles'
import {Dialog, FlatButton, RaisedButton, FontIcon, Card, CardHeader, CardMedia, CardTitle, List, ListItem, Divider,
    CardActions, Checkbox, TextField, CircularProgress} from 'material-ui'
import Markdown from 'react-markdown'

const {SingleJobProgress} = Pydio.requireLib('boot');
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
            versionError: undefined,
            watchJob: null,
            upgradePerformed: false
        };
    }

    dismiss(){
        this.props.onDismiss();
        this.setState({
            step:'ad',
            acceptEula: false,
            licenseKey: null,
            versionLoading: false,
            versionAvailable: false,
            versionError: undefined,
            watchJob: null,
            upgradePerformed: false,
        });
    }

    next(step){
        this.setState({step: step});
        if(step === "check"){
            const {licenseKey} = this.state;
            this.findVersion(licenseKey).catch(e => {
                // Revert to previous step.
                this.setState({step: 'license'})
            });
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
        return api.updateRequired(request).then(res => {
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
            throw e;
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
        const {step} = this.state;
        const {open, pydio, muiTheme} = this.props;
        const cardMessage = (id) => {return pydio.MessageHash['admin_dashboard.' + id]};
        const {accent2Color} = muiTheme.palette;
        const m = (id) => {return pydio.MessageHash['updater.upgrade.ed.' + id] || id };

        let content, actions;
        let title = m('title');
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
                    <FlatButton style={{float:'left'}} label={cardMessage('ent.btn.more')} onClick={()=>{window.open('https://pydio.com/en/features/pydio-cells-overview')}} />,
                    <FlatButton onClick={()=>this.dismiss()} label={m('button.cancel')} primary={false}/>,
                    <RaisedButton onClick={()=>{this.next('eula')}} label={m('button.start')} primary={true}/>
                ];
                break;

            case "eula":

                const {acceptEula} = this.state;
                content = (
                    <div style={Styles.body}>
                        <h5>1. {m('eula.title')}</h5>
                        <Markdown>{EnterpriseDistEULA}</Markdown>
                        <Checkbox label={m('eula.check')} checked={acceptEula} onCheck={(e,v)=>{this.setState({acceptEula: v})}}/>
                    </div>
                );
                actions = [
                    <FlatButton onClick={()=>this.dismiss()} label={m('button.cancel')} primary={false}/>,
                    <FlatButton onClick={()=>{this.next('license')}} label={m('button.next')} primary={true} disabled={!acceptEula}/>
                ];
                break;

            case "license":

                const {licenseKey, versionError} = this.state;
                let errorText;
                if(versionError){
                    errorText = m('version.error') +  ' : ' + versionError;
                }
                content = (
                    <div style={Styles.body}>
                        <h5>2. {m('key.title')}</h5>
                        <div>{m('key.legend')} <a href={"mailto:services@pydio.com"}>services@pydio.com</a>
                        </div>
                        <TextField
                            value={licenseKey}
                            onChange={(e,v)=>{this.setState({licenseKey: v, versionError: undefined})}}
                            floatingLabelText={m('key.hint')}
                            floatingLabelFixed={true}
                            multiLine={true}
                            rowsMax={16}
                            rows={10}
                            fullWidth={true}
                            errorText={errorText}
                        />
                    </div>
                );
                actions = [
                    <FlatButton style={{float:'left'}} label={cardMessage('ent.btn.contact')} onClick={()=>{window.open('https://pydio.com/en/pricing/contact')}} secondary={true}/>,
                    <FlatButton onClick={()=>this.dismiss()} label={m('button.cancel')} primary={false}/>,
                    <FlatButton onClick={()=>{this.next('check')}} label={m('button.next')} primary={true} disabled={!licenseKey}/>
                ];
                break;

            case "check":

                const {versionLoading, versionAvailable, versionsNoMatch} = this.state;
                content = (
                    <div style={Styles.body}>
                        {versionLoading &&
                            <div>
                                <h5>3. {m('version.loading')}</h5>
                                <div style={{display:'flex', width: '100%', height: 320, alignItems:'center', justifyContent:'center'}}><CircularProgress/></div>
                            </div>
                        }
                        {versionAvailable &&
                            <div>
                                <h5>3. {m('version.available').replace('%s', versionAvailable.Label)}</h5>
                                <div style={{backgroundColor: '#ECEFF1', padding: 16, borderRadius: 2, marginBottom: 20}}>
                                    <u>{m('version.released')}</u>: {new Date(versionAvailable.ReleaseDate * 1000).toISOString()}<br/>
                                    <u>{m('version.arch')}</u>: {versionAvailable.BinaryOS} - {versionAvailable.BinaryArch}<br/>
                                    <u>{m('version.description')}</u>: {versionAvailable.Description}<br/>
                                </div>
                                <p>
                                    {m('version.legend').replace('%s', 'CELLS_CONFIG/services/pydio.grpc.update')}
                                </p>
                            </div>
                        }
                        {!versionAvailable && versionsNoMatch && versionsNoMatch.length > 0 &&
                            <div>
                                <h5>3. {m('version.nomatch')}</h5>
                                <div>
                                    {m('version.nomatch.legend1')}
                                    <br/>
                                    {m('version.nomatch.legend2')}
                                    <ul>
                                    {versionsNoMatch.map(bin => {
                                        return <li>&gt; {bin.Version}</li>
                                    })}
                                    </ul>
                                </div>
                            </div>
                        }
                        {!versionLoading && !versionAvailable && (!versionsNoMatch || versionsNoMatch.length === 0) &&
                            <div>
                                <h5>3. {m('version.nomatch')}</h5>
                                <div>{m('version.nomatch.legend1')}</div>
                            </div>
                        }
                    </div>
                );
                actions = [
                    <FlatButton onClick={()=>this.dismiss()} label={m('button.cancel')} primary={false}/>,
                    <FlatButton onClick={()=>{this.next('perform')}} label={m('button.install')} primary={true} disabled={!versionAvailable}/>
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
                        <div style={Styles.body}>{m('installing')}</div>
                    )
                }

                actions = [
                    <FlatButton onClick={()=>this.dismiss()} label={m('button.close')} primary={true}/>,
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