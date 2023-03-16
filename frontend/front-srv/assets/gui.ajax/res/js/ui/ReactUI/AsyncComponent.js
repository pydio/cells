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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ResourcesManager from 'pydio/http/resources-manager';
import debounce from 'lodash.debounce'

/********************/
/* ASYNC COMPONENTS */
/********************/
/**
 * Load a component from server (if not already loaded) based on its namespace.
 */
class AsyncComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            namespace: props.namespace,
            componentName: props.componentName
        };

        this._handleLoad = debounce(this._handleLoad, 40)
    }

    _handleLoad() {
        const callback = () => {
            if (this.instance && !this.loadFired && typeof this.props.onLoad === 'function') {
                this.props.onLoad(this.instance);
                this.loadFired = true
            }
        };
        const {namespace, Component} = this.state
        if (Component) {
            // Class is already available, just doing the callback
            callback();
            return
        }

        // Loading the class asynchronously
        ResourcesManager.loadClass(namespace).then((ns) => {
            let {componentName} = this.state;
            while(componentName.split('.').length > 1){
                const [search, ...rest] = componentName.split('.')
                if(!ns[search]){
                    throw new Error('cannot find ' + componentName + ' in loaded namespace ' + namespace)
                }
                ns = ns[search]
                componentName = rest.join('.')
            }
            const {[componentName]: Component} = ns;
            this.setState({Component});
            callback();
        }).catch(e => {
            console.log('loadClass error', e)
            this.setState({hasError: true})
        })
    }

    componentDidMount() {
        this._handleLoad();
    }

    componentWillReceiveProps(newProps) {
        if (this.props.namespace !== newProps.namespace || this.props.componentName !== newProps.componentName) {
            // Trigger reload
            this.loadFired = false
            this.setState({
                namespace: newProps.namespace,
                componentName: newProps.componentName,
                Component: null
            });
        }
    }

    componentDidUpdate() {
        this._handleLoad();
    }

    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo);
    }

    static getDerivedStateFromError(error) {
        // Mettez à jour l'état, de façon à montrer l'UI de repli au prochain rendu.
        return { hasError: true, error };
    }

    render() {
        const {hasError, Component} = this.state;
        if(hasError) {
            return <div>Oops, something went wrong, please reload the window!</div>
        }
        if (!Component) {
            return null;
        }

        let props = this.props;
        const {modalData} = props;

        if (Component) {
            if (modalData && modalData.payload) {
                props = {
                    ...props,
                    ...modalData.payload
                }
            }

            return <Component {...props} ref={(instance) => { this.instance = instance; }} />;

        } else {
            const {namespace, componentName} = this.props;
            return <div>Component {namespace}.{componentName} not found!</div>;
        }
    }
}

AsyncComponent.propTypes = {
    namespace: PropTypes.string.isRequired,
    componentName: PropTypes.string.isRequired
};

export {AsyncComponent as default}
