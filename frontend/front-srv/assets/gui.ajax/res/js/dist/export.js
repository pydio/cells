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

window.React = require('react');
window.ReactDOM = require('react-dom');
window.PureRenderMixin = require('react-addons-pure-render-mixin');
window.ReactCSSTransitionGroup = require('react-addons-css-transition-group');
window.ReactMUI = require('material-ui-legacy');
window.MaterialUI = require('material-ui');
window.MaterialUI.Style = require('material-ui/styles');
window.MaterialUI.Color = require('color');
window.ReactDraggable = require('react-draggable');
window.ReactDND = require('react-dnd');
window.ReactDND.HTML5Backend = require('react-dnd-html5-backend');
window.ReactDND.flow = require('lodash/function/flow');
window.classNames = require('classnames');
window.ReactAutoSuggest = require('react-autosuggest');
window.Clipboard = require('clipboard');
window.ReactQRCode = require('qrcode.react');
window.Cronstrue = require("cronstrue");
window.injectTapEventPlugin = require('react-tap-event-plugin');
window.injectTapEventPlugin();