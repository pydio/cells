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

'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var PydioNode = require('pydio/model/node');

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var LangUtils = require('pydio/util/lang');

var _require2 = require('react-textfit');

var Textfit = _require2.Textfit;

var Breadcrumb = React.createClass({
    displayName: 'Breadcrumb',

    getInitialState: function getInitialState() {
        return { node: null, minFit: false };
    },

    componentDidMount: function componentDidMount() {
        var n = this.props.pydio.getContextHolder().getContextNode();
        if (n) {
            this.setState({ node: n });
        }
        this._observer = (function (event) {
            this.setState({ node: event.memo, minFit: false });
        }).bind(this);
        this.props.pydio.getContextHolder().observe("context_changed", this._observer);
    },

    componentWillUnmount: function componentWillUnmount() {
        this.props.pydio.getContextHolder().stopObserving("context_changed", this._observer);
    },

    goTo: function goTo(target, event) {
        var targetNode = new PydioNode(target);
        this.props.pydio.getContextHolder().requireContextChange(targetNode);
    },

    toggleMinFit: function toggleMinFit(font) {
        var minFit = this.state.minFit;

        var newMinFit = font === 12;
        if (newMinFit !== minFit) {
            this.setState({ minFit: newMinFit });
        }
    },

    render: function render() {
        var _this = this;

        var _props = this.props;
        var pydio = _props.pydio;
        var muiTheme = _props.muiTheme;
        var rootStyle = _props.rootStyle;
        var _state = this.state;
        var node = _state.node;
        var minFit = _state.minFit;

        var styles = {
            main: {
                fontSize: 21,
                height: 36,
                lineHeight: '44px',
                padding: '0 20px',
                color: muiTheme.appBar.textColor,
                width: '100%'
                /*
                maxWidth: '72%',
                flex:6
                */
            }
        };
        if (!pydio.user) {
            return React.createElement('span', { className: 'react_breadcrumb' });
        }
        var repoLabel = ' ';
        if (pydio.user && pydio.user.activeRepository && pydio.user.repositories.has(pydio.user.activeRepository)) {
            repoLabel = pydio.user.repositories.get(pydio.user.activeRepository).getLabel();
        }
        var segments = [];
        var path = node ? LangUtils.trimLeft(node.getPath(), '/') : '';
        var label = node ? node.getLabel() : '';
        var rebuilt = '';
        var mainStyle = rootStyle || {};
        mainStyle = _extends({}, styles.main, mainStyle);
        if (minFit) {
            mainStyle = _extends({}, mainStyle, { overflow: 'hidden' });
        }
        var parts = path.split('/');
        parts.forEach((function (seg, i) {
            if (!seg) return;
            rebuilt += '/' + seg;
            segments.push(React.createElement(
                'span',
                { key: 'bread_sep_' + i, className: 'separator' },
                ' / '
            ));
            segments.push(React.createElement(
                'span',
                { key: 'bread_' + i, className: 'segment', onClick: this.goTo.bind(this, rebuilt) },
                i === parts.length - 1 ? label : seg
            ));
        }).bind(this));
        return React.createElement(
            Textfit,
            { mode: 'single', perfectFit: false, min: 12, max: 22, className: 'react_breadcrumb', style: mainStyle, onReady: function (f) {
                    _this.toggleMinFit(f);
                } },
            this.props.startWithSeparator && React.createElement(
                'span',
                { className: 'separator' },
                ' / '
            ),
            React.createElement(
                'span',
                { className: 'segment first', onClick: this.goTo.bind(this, '/') },
                repoLabel
            ),
            segments
        );
    }

});

exports['default'] = Breadcrumb = muiThemeable()(Breadcrumb);

exports['default'] = Breadcrumb;
module.exports = exports['default'];
