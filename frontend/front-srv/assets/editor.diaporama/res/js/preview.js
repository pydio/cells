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



import React, {Component} from 'react'
import { ImageContainer } from './components'
import PydioApi from 'pydio/http/api'

class Preview extends Component {

    constructor(props){
        super(props);
        this.state = {src: ''};
    }

    componentDidMount(){
        const {node} = this.props;
        const p = PydioApi.getClient().buildPresignedGetUrl(node, null, 'image/jpeg', {Bucket: 'io', Key:'pydio-thumbstore/' + node.getMetadata().get('uuid') + '-512.jpg'});
        p.then((url) => {
            this.setState({src: url});
        })
    }

    render(){
        const {node, ...remainingProps} = this.props;
        const {src} = this.state;
        if (!src) {
            return null;
        }
        return (<ImageContainer
            {...remainingProps}
            src={src}
            imgStyle={{
                width: "100%",
                height: "100%",
                flex: 1
            }}
        />);
    }
}

export default Preview
