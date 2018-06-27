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

import { Component } from 'react'
import { bindActionCreators } from 'redux'
import { Toolbar, ToolbarGroup } from 'material-ui'

import {toTitleCase} from './utils'

const getDisplayName = (WrappedComponent) => {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const withMenu = (WrappedComponent) => {
    return class extends Component {
        static get displayName() {
            return `WithMenu(${getDisplayName(WrappedComponent)})`
        }

        static get defaultProps() {
            return {
                controls: []
            }
        }

        getControlsFromObject(controls, group) {
            return Object.keys(controls).map(type => {
                let {
                    [`${group}${toTitleCase(type)}Disabled`]: disabled,
                    [`on${toTitleCase(group)}${toTitleCase(type)}`]: handler,
                    ...props
                } = this.props

                if (typeof handler !== "function") return null

                return React.cloneElement(controls[type](handler), {disabled})
            }).filter(element => element)
        }

        render() {
            const {id, controls, dispatch, ...remainingProps} = this.props

            const groups = Object.keys(controls)

            const toolbarGroups = groups
                .map(group => (controls[group] instanceof Array) ? controls[group] : this.getControlsFromObject(controls[group], group))
                .filter(el => el.length > 0)
                .map((controls, index) => <ToolbarGroup firstChild={index === 0} lastChild={index === groups.length - 1}>{controls}</ToolbarGroup>)

            return (
                <div style={{display: "flex", flexDirection: "column", flex: 1, overflow: "auto"}}>
                    {toolbarGroups.length > 0 &&
                        <Toolbar style={{flexShrink: 0}}>
                            {toolbarGroups}
                        </Toolbar>
                    }

                    <WrappedComponent {...remainingProps} />
                </div>
            )
        }
    }
}

/*static get propTypes() {
    return Object.keys(newControls).map(type => ({
        [`${type}Disabled`]: React.PropTypes.bool,
        [`on${toTitleCase(type)}`]: React.PropTypes.func
    }))
}

static get defaultProps() {
    return Object.keys(newControls).map(type => ({
        [`${type}Disabled`]: false
    }))
}*/

const withControls = (newControls = {}) => {
    return (WrappedComponent) => {
        return class extends Component {

            static get displayName() {
                return `WithControls(${getDisplayName(WrappedComponent)})`
            }

            render() {
                let {controls = {}, ...remainingProps} = this.props

                return (
                    <WrappedComponent {...remainingProps} controls={{...newControls, ...controls}} />
                )
            }
        }
    }
}

export {withControls}
export {withMenu}
