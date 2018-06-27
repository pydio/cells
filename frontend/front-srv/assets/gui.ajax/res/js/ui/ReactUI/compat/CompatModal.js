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

const {Component} = require('react');
import AsyncModal from '../modal/AsyncModal'

class CompatModal extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {open: false};
    }

    componentDidMount(){
        const {pydio} = this.props;
        pydio.UI.registerModalOpener(this);
    }

    componentWillUnmount(){
        const {pydio} = this.props;
        pydio.UI.unregisterModalOpener();
    }

    open(namespace, component, props) {
        this.setState({
            open: true,
            modalData:{
                namespace: namespace,
                compName: component,
                payload: props
            }
        });
    }

    handleLoad() {
        this.setState({open: true})
    }

    handleClose() {
        this.setState({open: false});
    }

    render(){
        return (
            <AsyncModal
                ref="modal"
                open={this.state.open}
                componentData={{namespace:'PydioReactUI', compName:'CompatMigrationDialog'}}
                onLoad={this.handleLoad.bind(this)}
                onDismiss={this.handleClose.bind(this)}
            />
        );
    }
}

export {CompatModal as default}