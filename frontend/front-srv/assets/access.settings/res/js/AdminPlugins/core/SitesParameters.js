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
import {AutoComplete, Divider, Subheader} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import Loader from './Loader'
const {ModernStyles} = Pydio.requireLib('hoc');

const styles = {
    th: {
        padding: 8,
        fontWeight: 500
    },
    td: {
        padding: 8
    }
}

class SitesParameters extends React.Component {

    constructor() {
        super();
        this.state = {sites: [], mailerConfig: {}, shareConfig: {}};
    }

    componentDidMount(){
        const {pydio} = this.props;
        const loader = Loader.getInstance(pydio);
        loader.loadSites().then(data => data.Sites || []).then(sites => {
            this.setState({sites})
        });
        this.loadValues();
    }

    loadValues(){
        const {pydio} = this.props;
        const loader = Loader.getInstance(pydio);
        loader.loadServiceConfigs("pydio.grpc.mailer").then(data => {
            this.setState({mailerConfig: data});
        })
        loader.loadServiceConfigs("pydio.rest.share").then(data => {
            this.setState({shareConfig: data});
        })
    }

    onNewRequest(type, v) {
        const {mailerConfig, shareConfig} = this.state;
        const value = (typeof v === 'string') ? v : v.value
        if(type === 'share'){
            this.setState({shareConfig: {...shareConfig, url: value}}, () => this.save(type))
        } else if(type === 'mailer'){
            this.setState({mailerConfig: {...mailerConfig, url: value}}, () => this.save(type))
        }
    }

    save(type){
        const {mailerConfig, shareConfig} = this.state;
        const {pydio} = this.props;
        const loader = Loader.getInstance(pydio);
        if(type === 'mailer'){
            console.log('Saving mailer', mailerConfig);
            loader.saveServiceConfigs("pydio.grpc.mailer", mailerConfig).then(() => {
                this.setState({mailDirty: false});
            })
        } else {
            console.log('Saving share', shareConfig);
            loader.saveServiceConfigs("pydio.rest.share", shareConfig).then(() => {
                this.setState({shareDirty: false});
            });
        }
    }

    render(){
        const {muiTheme} = this.props;
        const {sites, shareConfig, mailerConfig, mailDirty, shareDirty} = this.state;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);
        const hStyle = adminStyles.body.block.headerFull;
        const urls = {};
        let defaultSite;
        sites.forEach(s => {
            if(!defaultSite && s.ReverseProxyURL){
                defaultSite = s.ReverseProxyURL;
            }
        })
        sites.forEach(s => {
            const scheme = (s.SelfSigned||s.LetsEncrypt||s.Certificate) ? "https://" : "http://";
            s.Binds.forEach(v => {
                urls[scheme + v] = scheme+v;
                if(!defaultSite){
                    defaultSite = scheme+v;
                }
            })
            if (s.ReverseProxyURL){
                urls[s.ReverseProxyURL] = s.ReverseProxyURL;
            }
        })
        const completeValues = Object.keys(urls).map(k => {return {text:k, value:k}});
        return (
            <div>
                <div style={hStyle}>Sites and URLs</div>
                <div style={{padding: '8px 16px 2px'}}>
                    <div className={"form-legend"}>External URL used for links in emails{mailDirty && " (hit enter to save)"}</div>
                    <AutoComplete
                        {...ModernStyles.textField}
                        hintText={defaultSite || "No defaults set"}
                        dataSource={completeValues}
                        filter={(searchText, key) => searchText === '' || key.indexOf(searchText) === 0}
                        fullWidth={true}
                        openOnFocus={true}
                        onUpdateInput={() => {this.setState({mailDirty:true})}}
                        searchText={mailerConfig.url || ''}
                        onNewRequest={(v) => {this.onNewRequest('mailer',v)}}
                    />
                </div>
                <div style={{padding: '0 16px 16px'}}>
                    <div className={"form-legend"}>Force share links URL{shareDirty && " (hit enter to save)"}</div>
                    <AutoComplete
                        {...ModernStyles.textField}
                        hintText={defaultSite || "No defaults set"}
                        dataSource={completeValues}
                        filter={(searchText, key) => searchText === '' || key.indexOf(searchText) === 0}
                        fullWidth={true}
                        openOnFocus={true}
                        onUpdateInput={() => {this.setState({shareDirty:true})}}
                        searchText={shareConfig.url || ''}
                        onNewRequest={(v) => {this.onNewRequest('share', v)}}
                    />
                </div>
                <Subheader style={{...hStyle, borderTop:hStyle.borderBottom}}>
                    Sites currently defined
                </Subheader>
                <div style={{padding:16, paddingBottom: 8}} className={"form-legend"}>Use './cells config sites' command to edit sites.</div>
                <div style={{backgroundColor: 'rgb(245 245 245)', margin: '0 16px 16px', borderRadius: 3}}>
                    <table style={{width: '100%'}}>
                        <tr>
                            <th style={styles.th}>Bind</th>
                            <th style={styles.th}>TLS</th>
                            <th style={styles.th}>External</th>
                        </tr>
                        {sites.map(s => {
                            let tls;
                            if(s.LetsEncrypt) {
                                tls = "Let's Encrypt"
                            } else if(s.SelfSigned) {
                                tls = "Self Signed"
                            } else if(s.Certificate) {
                                tls = "Certificate"
                            } else {
                                tls = "No TLS"
                            }
                            return (
                                <tr>
                                    <td style={styles.td}>{s.Binds.join(', ')}</td>
                                    <td style={styles.td}>{tls}</td>
                                    <td style={styles.td}>{s.ReverseProxyURL || "-"}</td>
                                </tr>
                            )
                        })}
                    </table>
                </div>
            </div>
        )
    }

}

SitesParameters = muiThemeable()(SitesParameters);
export default SitesParameters