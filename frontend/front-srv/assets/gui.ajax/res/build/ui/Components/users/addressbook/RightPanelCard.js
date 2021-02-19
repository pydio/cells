'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _TeamCard = require('./TeamCard');

var _TeamCard2 = _interopRequireDefault(_TeamCard);

var _UserCard = require('./UserCard');

var _UserCard2 = _interopRequireDefault(_UserCard);

var PropTypes = require('prop-types');
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

var React = require('react');

var _require = require('material-ui');

var Paper = _require.Paper;
var IconButton = _require.IconButton;

/**
 * Container for UserCard or TeamCard
 */

var RightPanelCard = (function (_React$Component) {
  _inherits(RightPanelCard, _React$Component);

  function RightPanelCard() {
    _classCallCheck(this, RightPanelCard);

    _React$Component.apply(this, arguments);
  }

  RightPanelCard.prototype.render = function render() {

    var content = undefined;
    var item = this.props.item || {};
    if (item.type === 'user') {
      content = React.createElement(_UserCard2['default'], this.props);
    } else if (item.IdmRole && item.IdmRole.IsTeam) {
      content = React.createElement(_TeamCard2['default'], this.props);
    }

    return React.createElement(
      Paper,
      { zDepth: 2, style: _extends({ position: 'relative' }, this.props.style) },
      React.createElement(IconButton, { iconClassName: "mdi mdi-close", style: { position: 'absolute', top: 0, right: 0 }, iconStyle: { color: '#e0e0e0' }, onClick: this.props.onRequestClose }),
      content
    );
  };

  return RightPanelCard;
})(React.Component);

RightPanelCard.propTypes = {
  /**
   * Pydio instance
   */
  pydio: PropTypes.instanceOf(Pydio),
  /**
   * Selected item
   */
  item: PropTypes.object,
  /**
   * Applies to root container
   */
  style: PropTypes.object,
  /**
   * Forwarded to child
   */
  onRequestClose: PropTypes.func,
  /**
   * Forwarded to child
   */
  onDeleteAction: PropTypes.func,
  /**
   * Forwarded to child
   */
  onUpdateAction: PropTypes.func
};

exports['default'] = RightPanelCard;
module.exports = exports['default'];
