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
import AsyncModal from './AsyncModal'

class Modal extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {open: false};
    }

    activityObserver(activityState){
        if(activityState.activeState === 'warning'){
            if(this.state.open && this.state.modalData && this.state.modalData.compName === 'ActivityWarningDialog'){
                return;
            }
            this.open('PydioReactUI', 'ActivityWarningDialog', {activityState:activityState});
        }else{
            this.setState({open: false, modalData:null});
        }
    }

    componentDidMount(){
        const {pydio} = this.props;
        pydio.UI.registerModalOpener(this);
        this._activityObserver = this.activityObserver.bind(this);
        pydio.observe('activity_state_change', this._activityObserver);
    }

    componentWillUnmount(){
        const {pydio} = this.props;
        pydio.UI.unregisterModalOpener();
        pydio.stopObserving('activity_state_change', this._activityObserver);
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
        if(this.state.open && this.state.modalData && this.state.modalData.compName === 'ActivityWarningDialog'){
            this.props.pydio.notify('user_activity');
        }
        this.setState({open: false, closing: true}, () => {
            // Take transition time into account - triggers a render so that if it
            // has been reopened in between, it correctly shows the new dialog
            setTimeout(()=>{this.setState({closing: false})}, 450)
        });
    }

    render(){
        return (
            <AsyncModal
                ref="modal"
                open={this.state.open}
                componentData={this.state.modalData}
                onLoad={this.handleLoad.bind(this)}
                onDismiss={this.handleClose.bind(this)}
            />
        );
    }
}

export {Modal as default}