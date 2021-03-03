/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
exports['default'] = PlaceHolders;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var PlaceHolder = _Pydio$requireLib.PlaceHolder;
var PhRoundShape = _Pydio$requireLib.PhRoundShape;
var PhTextRow = _Pydio$requireLib.PhTextRow;

function PlaceHolders(props) {
    var displayMode = props.displayMode;
    var elementHeight = props.elementHeight;
    var tableKeys = props.tableKeys;

    var customPH = undefined,
        multiplePH = [];
    if (displayMode === 'grid') {
        // Create thumbs like PH
        var tSize = Math.max(40, elementHeight);
        customPH = _react2['default'].createElement(
            'div',
            { style: { width: tSize, height: tSize, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 2 } },
            _react2['default'].createElement(
                'div',
                { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                _react2['default'].createElement(PhRoundShape, { style: { width: 40, height: 40 } })
            ),
            _react2['default'].createElement(PhTextRow, { style: { fontSize: 20 } })
        );
        for (var i = 0; i < 10; i++) {
            multiplePH.push(customPH);
        }
        multiplePH = _react2['default'].createElement(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap' } },
            multiplePH
        );
    } else if (tableKeys) {
        (function () {
            // Create table lines PH
            var wPercent = 100 / Object.keys(tableKeys).length;
            customPH = _react2['default'].createElement(
                'div',
                { style: { width: '100%', display: 'flex', alignItems: 'baseline', height: 50 } },
                Object.keys(tableKeys).map(function (k) {
                    var w = k === 'ajxp_label' ? 250 : wPercent + '%';
                    var f = k === 'ajxp_label' ? 16 : null;
                    return _react2['default'].createElement(
                        'span',
                        { style: { display: 'inline-block', width: w, fontSize: f, paddingLeft: 10, paddingRight: 10 } },
                        _react2['default'].createElement(PhTextRow, null)
                    );
                })
            );
            for (var i = 0; i < 5; i++) {
                multiplePH.push(customPH);
            }
        })();
    } else {
        customPH = _react2['default'].createElement(
            'div',
            { style: { display: 'flex', padding: '0 16px', alignItems: 'center', height: elementHeight, borderBottom: '1px solid rgba(0,0,0,.03)' } },
            _react2['default'].createElement(PhRoundShape, { style: { width: 40, height: 40, marginRight: 20 } }),
            _react2['default'].createElement(
                'div',
                { style: { flex: 1 } },
                _react2['default'].createElement(PhTextRow, { style: { fontSize: 16, width: '80%', marginTop: 0 } }),
                _react2['default'].createElement(PhTextRow, { style: { fontSize: 13, width: '70%' } })
            )
        );
        for (var i = 0; i < 5; i++) {
            multiplePH.push(customPH);
        }
    }

    return _react2['default'].createElement(PlaceHolder, { showLoadingAnimation: true, customPlaceholder: multiplePH });
}

module.exports = exports['default'];
