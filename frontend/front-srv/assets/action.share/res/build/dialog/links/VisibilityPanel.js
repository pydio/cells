'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpPolicies = require('pydio/http/policies');

var _pydioHttpPolicies2 = _interopRequireDefault(_pydioHttpPolicies);

var _cellsSdk = require('cells-sdk');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var ResourcePoliciesPanel = _Pydio$requireLib.ResourcePoliciesPanel;

var VisibilityPanel = (function (_React$Component) {
    _inherits(VisibilityPanel, _React$Component);

    function VisibilityPanel() {
        var _this = this;

        _classCallCheck(this, VisibilityPanel);

        _get(Object.getPrototypeOf(VisibilityPanel.prototype), 'constructor', this).apply(this, arguments);

        this.onSavePolicies = function (diffPolicies) {
            var _props = _this.props;
            var linkModel = _props.linkModel;
            var pydio = _props.pydio;

            var internalUser = linkModel.getLink().UserLogin;
            _pydioHttpPolicies2['default'].loadPolicies('user', internalUser).then(function (policies) {
                if (policies.length) {
                    var resourceId = policies[0].Resource;
                    var newPolicies = _this.diffPolicies(policies, diffPolicies, resourceId);
                    _pydioHttpPolicies2['default'].savePolicies('user', internalUser, newPolicies);
                }
            });
        };

        this.diffPolicies = function (policies, diffPolicies, resourceId) {
            var newPols = [];
            policies.map(function (p) {
                var key = p.Action + '///' + p.Subject;
                if (!diffPolicies.remove[key]) {
                    newPols.push(p);
                }
            });
            Object.keys(diffPolicies.add).map(function (k) {
                var newPol = new _cellsSdk.ServiceResourcePolicy();

                var _k$split = k.split('///');

                var _k$split2 = _slicedToArray(_k$split, 2);

                var action = _k$split2[0];
                var subject = _k$split2[1];

                newPol.Resource = resourceId;
                newPol.Effect = _cellsSdk.ServiceResourcePolicyPolicyEffect.constructFromObject('allow');
                newPol.Subject = subject;
                newPol.Action = action;
                newPols.push(newPol);
            });
            return newPols;
        };
    }

    _createClass(VisibilityPanel, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var linkModel = _props2.linkModel;
            var pydio = _props2.pydio;

            var subjectsHidden = [];
            subjectsHidden["user:" + linkModel.getLink().UserLogin] = true;
            var subjectDisables = { READ: subjectsHidden, WRITE: subjectsHidden };
            return _react2['default'].createElement(
                'div',
                { style: this.props.style },
                linkModel.getLink().Uuid && _react2['default'].createElement(ResourcePoliciesPanel, {
                    pydio: pydio,
                    resourceType: 'link',
                    description: this.props.getMessage('link.visibility.advanced'),
                    resourceId: linkModel.getLink().Uuid,
                    skipTitle: true,
                    onSavePolicies: this.onSavePolicies.bind(this),
                    subjectsDisabled: subjectDisables,
                    subjectsHidden: subjectsHidden,
                    readonly: this.props.isReadonly() || !linkModel.isEditable(),
                    ref: 'policies'
                })
            );
        }
    }]);

    return VisibilityPanel;
})(_react2['default'].Component);

VisibilityPanel.PropTypes = {
    pydio: _propTypes2['default'].instanceOf(_pydio2['default']).isRequired,
    linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default']).isRequired
};

VisibilityPanel = (0, _ShareContextConsumer2['default'])(VisibilityPanel);
exports['default'] = VisibilityPanel;
module.exports = exports['default'];

/**
 * Update associated hidden users policies, otherwise
 * the public link visibility cannot be changed
 * @param diffPolicies
 */
