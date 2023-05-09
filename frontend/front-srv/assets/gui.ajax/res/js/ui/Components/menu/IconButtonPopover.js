const PropTypes = require('prop-types');
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


const React = require('react')
import Pydio from 'pydio'
const {ThemedContainers:{Popover, IconButton}} = Pydio.requireLib('hoc')

class IconButtonPopover extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {showPopover: false};
    }

    showPopover(event){
        this.setState({
            showPopover: true,
            anchor: event.currentTarget
        })
    }

    render(){
        return (
            <span className={"toolbars-button-menu " + (this.props.className ? this.props.className  : '')}>
                <IconButton
                    ref="menuButton"
                    tooltip={this.props.buttonTitle}
                    iconClassName={this.props.buttonClassName}
                    onClick={this.showPopover.bind(this)}
                    iconStyle={this.props.buttonStyle}
                />
                <Popover
                    open={this.state.showPopover}
                    anchorEl={this.state.anchor}
                    anchorOrigin={{horizontal: this.props.direction || 'right', vertical: 'bottom'}}
                    targetOrigin={{horizontal: this.props.direction || 'right', vertical: 'top'}}
                    onRequestClose={() => {this.setState({showPopover: false})}}
                    useLayerForClickAway={false}
                >
                    {this.props.popoverContent}
                </Popover>
            </span>
        );
    }

}

IconButtonPopover.propTypes = {
    buttonTitle: PropTypes.string.isRequired,
    buttonClassName: PropTypes.string.isRequired,
    className: PropTypes.string,
    direction: PropTypes.oneOf(['right', 'left']),
    popoverContent: PropTypes.object.isRequired
}

export default IconButtonPopover