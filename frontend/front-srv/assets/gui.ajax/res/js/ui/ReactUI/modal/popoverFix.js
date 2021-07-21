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
 *
 * This is a fix for Popover in mui 0.20.1 + React 16
 * See https://github.com/mui-org/material-ui/issues/8040
 */

import React from 'react'
import { Paper, Popover } from 'material-ui'
import PopoverAnimationDefault from 'material-ui/Popover/PopoverAnimationDefault'

Popover.prototype.componentWillMount = function () {
    this.renderLayer = () => {
        const {
            animated,
            animation,
            anchorEl, // eslint-disable-line no-unused-vars
            anchorOrigin, // eslint-disable-line no-unused-vars
            autoCloseWhenOffScreen, // eslint-disable-line no-unused-vars
            canAutoPosition, // eslint-disable-line no-unused-vars
            children,
            onRequestClose, // eslint-disable-line no-unused-vars
            style,
            targetOrigin,
            useLayerForClickAway, // eslint-disable-line no-unused-vars
            scrollableContainer, // eslint-disable-line no-unused-vars
            ...other
        } = this.props

        let styleRoot = {
            ...style,
            opacity: this.state.setPlacement ? 1 : 0  // MADE EDIT HERE
        }

        if (!animated) {
            styleRoot = {
                position: 'fixed',
                zIndex: this.context.muiTheme.zIndex.popover
            }

            if (!this.state.open) {
                return null
            }

            return (
                <Paper style={Object.assign(styleRoot, style)} {...other}>
                    {children}
                </Paper>
            )
        }

        const Animation = animation || PopoverAnimationDefault

        return (
            <Animation
                targetOrigin={targetOrigin}
                style={styleRoot}
                {...other}
                open={this.state.open && !this.state.closing}
            >
                {children}
            </Animation>
        )
    }
}

Popover.prototype.componentWillReceiveProps = function (nextProps) {
    if (nextProps.open === this.props.open) {
        return
    }

    if (nextProps.open) {
        clearTimeout(this.timeout)
        this.timeout = null
        this.anchorEl = nextProps.anchorEl || this.props.anchorEl
        this.setState({
            open: true,
            closing: false,
            setPlacement: false
        }, () => {
            // MADE EDIT HERE
            setTimeout(() => {
                this.setState({
                    setPlacement: true
                })
            })
        })
    } else {
        if (nextProps.animated) {
            if (this.timeout !== null) {
                return
            }
            this.setState({ closing: true })
            this.timeout = setTimeout(() => {
                this.setState({
                    open: false
                }, () => {
                    this.timeout = null
                })
            }, 500)
        } else {
            this.setState({
                open: false
            })
        }
    }
}