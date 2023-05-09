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
import {muiThemeable} from 'material-ui/styles'
import Loader from './Loader'
const {ThemedModernStyles, ModernAutoComplete} = Pydio.requireLib('hoc');

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

    constructor(props) {
        super(props);
        this.state = {sites: [], mailerConfig: {}, shareConfig: {}};
    }

    componentDidMount(){
        const {pydio, type} = this.props;
        const loader = Loader.getInstance(pydio);
        // Sites must be loaded for both modes
        loader.loadSites().then(data => data.Sites || []).then(sites => {
            this.setState({sites})
        });
        if(type === 'externals'){
            this.loadValues();
        }
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

    onNewRequest(type, v, save) {
        const {mailerConfig, shareConfig} = this.state;
        const value = (typeof v === 'string') ? v : v.value
        let cb;
        if(save){
            cb = () => this.save(type);
        }
        if(type === 'share'){
            this.setState({shareConfig: {...shareConfig, url: value}}, cb)
        } else if(type === 'mailer'){
            this.setState({mailerConfig: {...mailerConfig, url: value}}, cb)
        }
    }

    save(type){
        const {mailerConfig, shareConfig} = this.state;
        const {pydio} = this.props;
        const loader = Loader.getInstance(pydio);
        if(type === 'mailer'){
            loader.saveServiceConfigs("pydio.grpc.mailer", mailerConfig).then(() => {
                this.setState({mailDirty: false});
            })
        } else {
            loader.saveServiceConfigs("pydio.rest.share", shareConfig).then(() => {
                this.setState({shareDirty: false});
            });
        }
    }

    render(){
        const {muiTheme, m, type} = this.props;
        const {sites, shareConfig, mailerConfig, mailDirty, shareDirty} = this.state;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);
        const ModernStyles = ThemedModernStyles(muiTheme)

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
            const re = new RegExp(':80$|:443$');
            s.Binds.forEach(v => {
                let url = scheme+v
                url = url.replace(re, '')
                urls[url] = url;
                if(!defaultSite){
                    defaultSite = url;
                }
            })
            if (s.ReverseProxyURL){
                urls[s.ReverseProxyURL] = s.ReverseProxyURL;
            }
        })
        const completeValues = Object.keys(urls).map(k => {return {text:k, value:k}});

        if(type === 'sites') {
            return (
                <div>
                    <div style={hStyle}>{m('sites.title')}</div>

                    <div style={{padding:'8px 16px', fontSize: 12, color: 'inherit', fontWeight: 'normal'}} className={"form-legend"} dangerouslySetInnerHTML={{__html:m('sites.details')}}/>
                    <div style={{padding:'8px 16px'}} className={"form-legend"}>{m('sites.detected.sites')}</div>

                    <div style={{backgroundColor: 'rgb(245 245 245)', margin: '0 16px 16px', borderRadius: 3}}>
                        <table style={{width: '100%'}}>
                            <tr>
                                <th style={styles.th}>{m('sites.column.bind')}</th>
                                <th style={styles.th}>{m('sites.column.tls')}</th>
                                <th style={styles.th}>{m('sites.column.external')}</th>
                            </tr>
                            {sites.map(s => {
                                let tls;
                                if(s.LetsEncrypt) {
                                    tls = m('sites.configs.tls.letsencrypt')
                                } else if(s.SelfSigned) {
                                    tls = m('sites.configs.tls.self')
                                } else if(s.Certificate) {
                                    tls = m('sites.configs.tls.certificate')
                                } else {
                                    tls = m('sites.configs.tls.notls')
                                    if(s.ReverseProxyURL && s.ReverseProxyURL.indexOf('https://') === 0) {
                                        tls = m('sites.configs.tls.notls-reverse')
                                    }
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

                    <div style={{padding:'8px 16px 16px', fontSize: 12, color: 'inherit', fontWeight: 'normal'}} className={"form-legend"} dangerouslySetInnerHTML={{__html:m('sites.details.note')}}/>
                </div>
            )

        } else {

            return (
                <div>
                    <div style={hStyle}>{m('sites.externals')}</div>

                    <div style={{padding: '8px 16px 2px'}}>

                        <div style={{paddingBottom:8, fontSize: 12, color: 'inherit', fontWeight: 'normal'}} className={"form-legend"} dangerouslySetInnerHTML={{__html: m('sites.externals.details')}}/>
                        <ModernAutoComplete
                            {...ModernStyles.textField}
                            floatingLabelText={m('sites.mailer.url') + (mailDirty ? (" " + m('sites.enter-to-save')):'')}
                            hintText={defaultSite || m('sites.no-defaults')}
                            dataSource={completeValues}
                            filter={(searchText, key) => searchText === '' || key.indexOf(searchText) === 0}
                            fullWidth={true}
                            openOnFocus={true}
                            onUpdateInput={(searchText) => {this.onNewRequest('mailer', searchText, false); this.setState({mailDirty:true})}}
                            searchText={mailerConfig.url || ''}
                            onNewRequest={(v) => {this.onNewRequest('mailer',v, true)}}
                        />
                    </div>
                    <div style={{padding: '0 16px 16px'}}>
                        <ModernAutoComplete
                            {...ModernStyles.textField}
                            floatingLabelText={m('sites.links.url') + (shareDirty ? (" " + m('sites.enter-to-save')):'')}
                            hintText={defaultSite || m('sites.no-defaults')}
                            dataSource={completeValues}
                            filter={(searchText, key) => searchText === '' || key.indexOf(searchText) === 0}
                            fullWidth={true}
                            openOnFocus={true}
                            onUpdateInput={(searchText) => {this.onNewRequest('share', searchText, false); this.setState({shareDirty:true})}}
                            searchText={shareConfig.url || ''}
                            onNewRequest={(v) => {this.onNewRequest('share', v, true)}}
                        />
                    </div>

                </div>
            )

        }
    }

}

SitesParameters = muiThemeable()(SitesParameters);
export default SitesParameters