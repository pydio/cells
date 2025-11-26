/*
 * Copyright 2025 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import {Component} from 'react'
import ResourcesManager from 'pydio/http/resources-manager'

class PdfBadge extends Component{

    constructor(props, context){
        super(props, context);
        const {node, pydio} = props;
        this.state = {hasImagePreview : false};
        if(node.getMetadata().get('ImagePreview') && pydio.Registry.findEditorById('editor.diaporama')){
            ResourcesManager.loadClass('PydioDiaporama').then( ns => {
                this.setState({hasImagePreview: true, Badge:ns.Badge});
            })
        }

    }

    render(){

        const {hasImagePreview, Badge} = this.state;
        if(hasImagePreview) {
            return <Badge {...this.props}/>
        } else {
            return <div className="mimefont mdi-file-pdf" style={this.props.mimeFontStyle}/>;
        }

    }

}

export {PdfBadge as default}