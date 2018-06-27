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

import React, {Component} from 'react';
import ResourcesManager from 'pydio/http/resources-manager';

import _ from 'lodash';

/********************/
/* ASYNC COMPONENTS */
/********************/
/**
 * Load a component from server (if not already loaded) based on its namespace.
 */
class AsyncComponent extends Component {

    constructor(props) {
        super(props)

        this.state = {
            loaded: false
        }

        this._handleLoad = _.debounce(this._handleLoad, 100)
    }

    _handleLoad() {
        const callback = () => {
            if (this.instance && !this.loadFired && typeof this.props.onLoad === 'function') {
                this.props.onLoad(this.instance)
                this.loadFired = true
            }
        }

        if (!this.state.loaded) {
            // Loading the class asynchronously
            ResourcesManager.loadClassesAndApply([this.props.namespace], () => {
                this.setState({loaded:true});
                callback();
            })
        } else {
            // Class is already available, just doing the callback
            callback();
        }
    }

    componentDidMount() {
        this._handleLoad();
    }

    componentWillReceiveProps(newProps) {
        if (this.props.namespace != newProps.namespace) {
            this.loadFired = false;
            this.setState({loaded:false});
        }
    }

    componentDidUpdate() {
        this._handleLoad();
    }

    render() {
        if (!this.state.loaded) return null

        let props = this.props
        const {namespace, componentName, modalData} = props
        const nsObject = window[this.props.namespace];
        const Component = FuncUtils.getFunctionByName(this.props.componentName, window[this.props.namespace]);

        if (Component) {
            if (modalData && modalData.payload) {
                props = {
                    ...props,
                    ...modalData.payload
                }
            }

            return <Component {...props} ref={(instance) => { this.instance = instance; }} />;

        } else {
            return <div>Component {namespace}.{componentName} not found!</div>;
        }
    }
}

AsyncComponent.propTypes = {
    namespace: React.PropTypes.string.isRequired,
    componentName: React.PropTypes.string.isRequired
}

// AsyncComponent = PydioHOCs.withLoader(AsyncComponent)

export {AsyncComponent as default}
