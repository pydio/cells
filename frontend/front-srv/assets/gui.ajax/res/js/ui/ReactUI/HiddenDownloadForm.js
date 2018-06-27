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

export default class HiddenDownloadForm extends React.Component {

    constructor(props) {
        super(props)

        this.state = {}

        this.configs = pydio.getPluginConfigs('mq');

        this.validateDownload = () => {
            try {
                const iframe = this.iframe.contentDocument || this.iframe.contentWindow.document
            } catch(e) {
                // Setting the BOOSTER DOWNLOAD to off
                this.configs.set("DOWNLOAD_ACTIVE", false)
                this.forceUpdate();
            }
        }
    }

    static get propTypes() {
        return {
            pydio: React.PropTypes.instanceOf(Pydio).isRequired
        }
    }

    componentDidMount() {
        pydio.UI.registerHiddenDownloadForm(this);

        this.iframe.addEventListener("load", this.validateDownload, true)
    }

    componentWillUnmount() {
        pydio.UI.unRegisterHiddenDownloadForm(this);

        this.iframe.removeEventListener("load", this.validateDownload)
    }

    triggerDownload(userSelection, parameters){
        if (parameters['presignedUrl']) {
            this.iframe.src = parameters['presignedUrl'];
            return;
        }
        this.setState({
            nodes: userSelection ? userSelection.getSelectedNodes() : null,
            parameters: parameters
        }, () => {
            this.refs.form.submit();
            this.timeout = setTimeout(() => this.validateDownload(), 1000)
        });
    }

    render() {
        const {nodes, parameters} = this.state

        // Variables to fill
        let url;

        if (nodes && nodes.length === 1 && nodes[0].isLeaf() && this.configs.get("DOWNLOAD_ACTIVE")) {
            let secure = this.configs.get("BOOSTER_MAIN_SECURE");
            if(this.configs.get("BOOSTER_DOWNLOAD_ADVANCED") && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['booster_download_advanced'] === 'custom' && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_SECURE']){
                secure = this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_SECURE'];
            }
            let host = this.configs.get("BOOSTER_MAIN_HOST");
            if(this.configs.get("BOOSTER_DOWNLOAD_ADVANCED") && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['booster_download_advanced'] === 'custom' && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_HOST']){
                host = this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_HOST'];
            }
            var port = this.configs.get("BOOSTER_MAIN_PORT");
            if(this.configs.get("BOOSTER_DOWNLOAD_ADVANCED") && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['booster_download_advanced'] === 'custom' && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_PORT']){
                port = this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_PORT'];
            }

            url = `http${secure?"s":""}://${host}:${port}/${this.configs.get("DOWNLOAD_PATH")}/${pydio.user.activeRepository}/`;
        } else {
            url = pydio.Parameters.get('ajxpServerAccess')
        }

        return (
            <div style={{visibility:'hidden', position:'absolute', left: -10000}}>
                <form ref="form" action={url} target="dl_form_iframe">
                    {parameters && Object.keys(parameters).map(key =>
                        <input type="hidden" name={key} key={key} value={parameters[key]}/>
                    )}
                    {nodes && nodes.map(node =>
                        <input type="hidden" name="nodes[]" key={node.getPath()} value={node.getPath()}/>
                    )}
                </form>
                <iframe ref={(iframe) => this.iframe = iframe} name="dl_form_iframe"></iframe>
            </div>
        );
    }
}
