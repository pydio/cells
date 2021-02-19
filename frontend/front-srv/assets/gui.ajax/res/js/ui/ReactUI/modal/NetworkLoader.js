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
const createReactClass = require('create-react-class');

export default createReactClass({

    componentDidMount: function(){
        this.props.pydio.observe('connection-start', () => { this.setState({show: true}) });
        this.props.pydio.observe('connection-end', () => { this.setState({show: false}) });
    },

    getInitialState: function(){
        return {show: false};
    },

    render: function(){
        const style = {
            display: this.state.show?'block':'none'
        };
        return (
            <div className="indeterminate-loader" style={style}/>
        );

    }

});