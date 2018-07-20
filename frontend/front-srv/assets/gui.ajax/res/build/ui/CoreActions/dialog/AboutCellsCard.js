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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _materialUi = require('material-ui');

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var AboutCellsCard = (function (_Component) {
    _inherits(AboutCellsCard, _Component);

    function AboutCellsCard() {
        _classCallCheck(this, AboutCellsCard);

        _Component.apply(this, arguments);
    }

    AboutCellsCard.prototype.openDocs = function openDocs() {
        open("https://github.com/pydio/cells/wiki");
    };

    AboutCellsCard.prototype.openForum = function openForum() {
        open("https://forum.pydio.com");
    };

    AboutCellsCard.prototype.openGithub = function openGithub() {
        open("https://github.com/pydio/cells/issues");
    };

    AboutCellsCard.prototype.render = function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var style = _props.style;

        var imgBase = pydio.Parameters.get('ajxpResourcesFolder') + '/themes/common/images';

        return React.createElement(
            _materialUi.Card,
            { style: style },
            React.createElement(_materialUi.CardTitle, { title: 'About Pydio Cells', subtitle: 'Future-proof file-sharing platform' }),
            React.createElement(
                _materialUi.CardText,
                null,
                'Pydio Cells is a full rewrite of the PHP server into #Go, the server language used by Google on their own datacenters all over the world. It is designed with scalability and open standards in mind, and based on a micro-services architecture. Please refer to the dedicated documentation to read more about this new architecture and how you can help testing it.',
                React.createElement('br', null),
                'Contributions and bug reports are welcome on our Github repository. Please make sure to read the Contributing instructions and to give as much details as possible to provide a reproducible scenario!'
            ),
            React.createElement(_materialUi.Divider, null),
            React.createElement(
                _materialUi.CardActions,
                null,
                React.createElement(_materialUi.FlatButton, { primary: true, icon: React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-book-variant' }), label: 'Docs', onTouchTap: this.openDocs }),
                React.createElement(_materialUi.FlatButton, { primary: true, icon: React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-slack' }), label: 'Forums', onTouchTap: this.openForum }),
                React.createElement(_materialUi.FlatButton, { primary: true, icon: React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-github-box' }), label: 'Issues', onTouchTap: this.openGithub })
            )
        );
    };

    return AboutCellsCard;
})(_react.Component);

exports['default'] = AboutCellsCard = PydioContextConsumer(AboutCellsCard);

exports['default'] = AboutCellsCard;
module.exports = exports['default'];
