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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var SearchFileFormatPanel = (function (_Component) {
    _inherits(SearchFileFormatPanel, _Component);

    function SearchFileFormatPanel(props) {
        _classCallCheck(this, SearchFileFormatPanel);

        _Component.call(this, props);

        this.state = {
            folder: this.props.values['ajxp_mime'] && this.props.values['ajxp_mime'] === 'ajxp_folder' ? true : undefined,
            ext: this.props.values['ajxp_mime'] && this.props.values['ajxp_mime'] !== 'ajxp_folder' ? this.props.values['ajxp_mime'] : undefined
        };
    }

    SearchFileFormatPanel.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
        if (prevState === this.state) return;

        var _state = this.state;
        var folder = _state.folder;
        var ext = _state.ext;

        this.props.onChange({
            ajxp_mime: folder ? 'ajxp_folder' : ext
        });
    };

    SearchFileFormatPanel.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var inputStyle = _props.inputStyle;
        var getMessage = _props.getMessage;

        var props = _objectWithoutProperties(_props, ['inputStyle', 'getMessage']);

        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(_materialUi.Toggle, {
                style: inputStyle,
                name: 'toggleFolder',
                value: 'ajxp_folder',
                label: getMessage(502),
                toggled: this.state.folder,
                onToggle: function (e, toggled) {
                    return _this.setState({ folder: toggled });
                }
            }),
            !this.state.folder && _react2['default'].createElement(_materialUi.TextField, {
                style: inputStyle,
                className: 'mui-text-field',
                hintText: getMessage(500),
                floatingLabelFixed: true,
                floatingLabelText: getMessage(500),
                value: this.state.ext,
                onChange: function (e) {
                    return _this.setState({ ext: e.target.value });
                }
            })
        );
    };

    return SearchFileFormatPanel;
})(_react.Component);

SearchFileFormatPanel = PydioContextConsumer(SearchFileFormatPanel);
exports['default'] = SearchFileFormatPanel;
module.exports = exports['default'];
