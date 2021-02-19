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
const ReactDOM = require('react-dom')
const {Menu, Paper} = require('material-ui')
import Utils from './Utils'

export default class extends React.Component {
    static propTypes = {
        menuItems: PropTypes.array.isRequired,
        onExternalClickCheckElements: PropTypes.func,
        className: PropTypes.string,
        style:PropTypes.object,
        onMenuClosed: PropTypes.func
    };

    state = {showMenu:false, menuItems:this.props.menuItems};

    showMenu = (style = null, menuItems = null) => {
        this.setState({
            showMenu: true,
            style: style,
            menuItems:menuItems?menuItems:this.state.menuItems
        });
    };

    hideMenu = (event) => {
        if(!event){
            this.setState({showMenu: false});
            if(this.props.onMenuClosed) this.props.onMenuClosed();
            return;
        }
        // Firefox trigger a click event when you mouse up on contextmenu event
        if (typeof event !== 'undefined' && event.button === 2 && event.type !== 'contextmenu') {
            return;
        }
        const node = ReactDOM.findDOMNode(this.refs.menuContainer);
        if(node.contains(event.target) || node === event.target ){
            return;
        }

        this.setState({showMenu: false});
        if(this.props.onMenuClosed) this.props.onMenuClosed();

    };

    componentDidMount() {
        this._observer = this.hideMenu;
    }

    componentWillUnmount() {
        document.removeEventListener('click', this._observer, false);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.menuItems){
            this.setState({menuItems:nextProps.menuItems});
        }
    }

    componentDidUpdate(prevProps, nextProps) {
        if(this.state.showMenu){
            document.addEventListener('click', this._observer, false);
        }else{
            document.removeEventListener('click', this._observer, false);
        }
    }

    menuClicked = (event, index, menuItem) => {
        this.hideMenu();
    };

    render() {

        let style = this.state.style || {};
        style = {...style, zIndex: 1000};
        const menu = Utils.itemsToMenu(this.state.menuItems, this.menuClicked, false, {desktop:true, display:'right', width: 250, ...this.props.menuProps});
        if(this.state.showMenu) {
            return <Paper zDepth={this.props.zDepth || 1} ref="menuContainer" className="menu-positioner" style={style}>{menu}</Paper>
        }else{
            return null;
        }
    }
}
