/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import MetaClient from "../MetaClient";

export default function asMetaField(Component){

    return class MetaField extends React.Component {

        constructor(props) {
            super(props);
            this.state = {
                value: this.props.value || 0,
                configs: this.props.configs || new Map(),
                getRealValue: () => {
                    const {node, column} = this.props;
                    return node.getMetadata().get(column.name)
                }
            }
        }

        componentDidMount() {
            if(!this.props.configs){
                MetaClient.getInstance().loadConfigs().then(configs =>{
                    this.setState({configs})
                })
            }
        }

        render() {

            return <Component {...this.props} {...this.state}/>

        }

    }

}