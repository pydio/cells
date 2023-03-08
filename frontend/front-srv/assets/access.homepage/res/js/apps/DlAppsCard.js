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

const React = require('react');
import DownloadApp from './DownloadApp'
import ColorPaper from '../board/ColorPaper'
const {asGridItem} = require('pydio').requireLib('components');

class DlAppsPanel extends React.Component{

    render(){
        let configs = this.props.pydio.getPluginConfigs('access.homepage');
        let mobileBlocks = [], syncBlocks = [];
        if(configs.get('URL_APP_IOSAPPSTORE')){
            mobileBlocks.push(
                <DownloadApp
                    {...this.props}
                    id="dl_pydio_ios"
                    key="dl_pydio_ios"
                    configs={configs}
                    configHref="URL_APP_IOSAPPSTORE"
                    containerClassName="mdi mdi-cellphone-iphone"
                    iconClassName="mdi mdi-apple"
                    messageId="user_home.59"
                    tooltipId="user_home.70"
                />

            );
        }
        if(configs.get('URL_APP_ANDROID')){
            mobileBlocks.push(
                <DownloadApp
                    {...this.props}
                    id="dl_pydio_android"
                    key="dl_pydio_android"
                    configs={configs}
                    configHref="URL_APP_ANDROID"
                    containerClassName="mdi mdi-cellphone-android"
                    iconClassName="mdi mdi-android"
                    messageId="user_home.58"
                    tooltipId="user_home.71"
                />
            );
        }
        if(configs.get('URL_APP_SYNC_WIN')){
            syncBlocks.push(
                <DownloadApp
                    {...this.props}
                    id="dl_pydio_win"
                    key="dl_pydio_win"
                    configs={configs}
                    configHref="URL_APP_SYNC_WIN"
                    containerClassName="mdi mdi-laptop-windows"
                    iconClassName="mdi mdi-windows"
                    messageId="user_home.61"
                    tooltipId="user_home.68"
                />
            );
        }
        if(configs.get('URL_APP_SYNC_MAC')){
            syncBlocks.push(
                <DownloadApp
                    {...this.props}
                    id="dl_pydio_mac"
                    key="dl_pydio_mac"
                    configs={configs}
                    configHref="URL_APP_SYNC_MAC"
                    containerClassName="mdi mdi-laptop-mac"
                    iconClassName="mdi mdi-apple"
                    messageId="user_home.60"
                    tooltipId="user_home.69"
                />
            );
        }

        return (
            <div style={{textAlign: 'center', paddingTop: 5}}>{this.props.type === 'sync' ? syncBlocks : mobileBlocks}</div>
        );
    }

}


class DlAppsCard extends React.Component {
    render() {
        let props = {...this.props};
        return (
            <ColorPaper {...this.props} style={{...this.props.style,overflow:'visible'}} paletteIndex={1} closeButton={props.closeButton}>
                <DlAppsPanel pydio={this.props.pydio} type="sync" iconColor={'#ffffff'}/>
                <div style={{fontSize: 16, padding: 16, paddingTop: 0, textAlign:'center'}}>{this.props.pydio.MessageHash['user_home.91']}</div>
            </ColorPaper>
        );
    }
}

DlAppsCard = asGridItem(DlAppsCard,global.pydio.MessageHash['user_home.92'],{gridWidth:2,gridHeight:10},[]);
export {DlAppsCard as default}
