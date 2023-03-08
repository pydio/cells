/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation either version 3 of the License or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import React from 'react'
import ReactDom from 'react-dom'
import * as Redux from 'redux'
import * as ReactRedux from 'react-redux'


import * as MUI from 'material-ui'
import * as MUIStyle from 'material-ui/styles'
import Color from 'color'
const materialFull = {...MUI, Color, MUIStyle}

import * as ReactDND from 'react-dnd'
import * as DNDBackend from 'react-dnd-html5-backend'
import Flow from 'lodash/flow'
const dndFull = {...ReactDND, HTML5Backend:DNDBackend, flow: Flow}

import APRM from 'react-addons-pure-render-mixin'
import ACTG from 'react-addons-css-transition-group'
import AU from 'react-addons-update'
import Infinite from 'react-infinite'
import Draggable from 'react-draggable'
import CreateClass from 'create-react-class'
import PropTypes from 'prop-types'
import * as TextFit from 'react-textfit'
import Lodash from 'lodash'
import Debounce from 'lodash.debounce'
import cNames from 'classnames'
import Clipboard from 'clipboard'
import WFetch from 'whatwg-fetch'
import QRCodeReact from 'qrcode.react'
import ReactMarkdown from 'react-markdown'

// Temporary backward compat, last cleaning @TODO
window.React = React
//window.classNames = cNames

const originalRequire = window.require || require;
if(originalRequire) {

    window.require = function(libName){

        //do your thing here
        switch(libName) {
            case 'react':
                return React
            case 'react-dom':
                return ReactDom
            case 'material-ui':
                return materialFull
            case 'material-ui/styles':
                return MUIStyle
            case 'react-addons-pure-render-mixin':
                return APRM
            case 'react-addons-css-transition-group':
                return ACTG
            case 'react-addons-update':
                return AU
            case 'react-infinite':
                return Infinite
            case 'react-draggable':
                return Draggable
            case  'react-redux':
                return ReactRedux
            case 'react-dnd':
                return dndFull
            case 'create-react-class':
                return CreateClass
            case 'prop-types':
                return PropTypes
            case 'react-dnd-html5-backend':
                return DNDBackend
            case 'react-textfit':
                return TextFit
            case 'color':
                return Color
            case 'lodash/flow':
                return Flow
            case 'lodash':
                return Lodash
            case 'lodash.debounce':
                return Debounce
            case 'classnames':
                return cNames
            case 'clipboard':
                return Clipboard
            case 'whatwg-fetch':
                return WFetch
            case 'redux':
                return Redux
            case 'qrcode.react':
                return QRCodeReact
            case 'react-markdown':
                return ReactMarkdown
            default:
                break;
        }
        return originalRequire.apply(this, arguments);
    };
}

import '../../themes/material/css/pydio.less'

export default {}