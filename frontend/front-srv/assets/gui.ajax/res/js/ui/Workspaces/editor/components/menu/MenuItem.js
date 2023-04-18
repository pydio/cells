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

import React from 'react'
import Pydio from 'pydio';
import { connect } from 'react-redux';
import { FloatingActionButton } from 'material-ui';
import _ from 'lodash';

const { getActiveTab, EditorActions } = Pydio.requireLib('hoc');

class MenuItem extends React.PureComponent {

    constructor(props) {
        super(props)

        const {editorSetActiveTab, editorModify} = props

        this.onClick = () => {
            editorModify({isMinimised: false})
            editorSetActiveTab(this.props.id)
        }
    }

    render() {
        const {style, tab} = this.props

        if (_.isEmpty(tab)) {
            return null
        }

        const textStyle = {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 100,
            maxWidth: 100,
            textAlign: "center",
            left: -120,
            lineHeight: "30px",
            margin: "5px 0",
            padding: "0 5px",
            borderRadius: 4,
            background: "#000000",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            color: "#ffffff",
            opacity: "0.7"
        }

        return (
            <div style={style} onClick={this.onClick}>
                <span style={textStyle}>{tab.title}</span>
                <FloatingActionButton mini={true} ref="container" backgroundColor="#FFFFFF" zDepth={2} iconStyle={{backgroundColor: "#FFFFFF"}}>
                    <tab.icon {...this.props.tab} style={{fill: "#000000", flex: 1, alignItems: "center", justifyContent: "center", fontSize: 28, color: "#607d8b"}} loadThumbnail={true} />
                </FloatingActionButton>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    const {tabs = {}} = state
    
    let current = tabs.filter(tab => tab.id === ownProps.id)[0]

    return  {
        ...ownProps,
        tab: current
    }
}

const ConnectedMenuItem = connect(mapStateToProps, EditorActions)(MenuItem)

export default ConnectedMenuItem
