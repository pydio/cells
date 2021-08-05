/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {createRef} from 'react';

export default class HiddenDownloadForm extends React.Component {

    constructor(props) {
        super(props);
        this.iframe = createRef();
    }

    componentDidMount() {
        this.props.pydio.UI.registerHiddenDownloadForm(this);
    }

    componentWillUnmount() {
        this.props.pydio.UI.unRegisterHiddenDownloadForm(this);
    }

    triggerDownload(userSelection, parameters){
        if (parameters['presignedUrl']) {
            this.iframe.current.src = parameters['presignedUrl'];
        }
    }

    render() {
        return (
            <div style={{visibility:'hidden', position:'absolute', left: -10000}}>
                <iframe ref={this.iframe} name="dl_form_iframe"></iframe>
            </div>
        );
    }
}
