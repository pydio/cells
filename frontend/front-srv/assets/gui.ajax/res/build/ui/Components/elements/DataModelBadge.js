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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var DataModelBadge = (function (_React$Component) {
    _inherits(DataModelBadge, _React$Component);

    function DataModelBadge() {
        _classCallCheck(this, DataModelBadge);

        _React$Component.apply(this, arguments);
    }

    DataModelBadge.prototype.componentDidMount = function componentDidMount() {
        var _this = this;

        var _props = this.props;
        var dataModel = _props.dataModel;
        var options = _props.options;

        this._observer = function () {
            var newValue = '';
            switch (options.property) {
                case "root_children":
                    var l = dataModel.getRootNode().getChildren().size;
                    newValue = l ? l : 0;
                    break;
                case "root_label":
                    newValue = dataModel.getRootNode().getLabel();
                    break;
                case "root_children_empty":
                    var cLength = dataModel.getRootNode().getChildren().size;
                    newValue = cLength ? '' : options['emptyMessage'];
                    break;
                case "metadata":
                    if (options['metadata_sum']) {
                        newValue = 0;
                        dataModel.getRootNode().getChildren().forEach(function (c) {
                            if (c.getMetadata().get(options['metadata_sum'])) {
                                newValue += parseInt(c.getMetadata().get(options['metadata_sum']));
                            }
                        });
                    }
                    break;
                default:
                    break;
            }
            var prevValue = _this.state.value;
            if (newValue && newValue !== prevValue) {
                if (Object.isNumber(newValue) && _this.props.onBadgeIncrease && prevValue !== '' && newValue > prevValue) {
                    _this.props.onBadgeIncrease(newValue, prevValue ? prevValue : 0, _this.props.dataModel);
                }
            }
            if (_this.props.onBadgeChange) {
                _this.props.onBadgeChange(newValue, prevValue, _this.props.dataModel);
            }
            _this.setState({ value: newValue });
        };

        dataModel.getRootNode().observe("loaded", this._observer);
    };

    DataModelBadge.prototype.componentWillUnmount = function componentWillUnmount() {
        this.props.dataModel.stopObserving("loaded", this._observer);
    };

    DataModelBadge.prototype.render = function render() {
        if (this.state.value) {
            return _react2['default'].createElement(
                'span',
                { className: this.props.options['className'] },
                this.state.value
            );
        } else {
            return null;
        }
    };

    return DataModelBadge;
})(_react2['default'].Component);

exports['default'] = DataModelBadge;
module.exports = exports['default'];
