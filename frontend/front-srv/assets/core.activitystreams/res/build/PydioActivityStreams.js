(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioActivityStreams = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactMarkdown = require('react-markdown');

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

var _materialUi = require('material-ui');

var _DocLink = require('./DocLink');

var _DocLink2 = _interopRequireDefault(_DocLink);

var _require$requireLib = require('pydio').requireLib('components');

var UserAvatar = _require$requireLib.UserAvatar;

var _require$requireLib2 = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib2.PydioContextConsumer;

var _Pydio$requireLib = Pydio.requireLib('boot');

var moment = _Pydio$requireLib.moment;

var Paragraph = (function (_React$Component) {
    _inherits(Paragraph, _React$Component);

    function Paragraph() {
        _classCallCheck(this, Paragraph);

        _get(Object.getPrototypeOf(Paragraph.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Paragraph, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'span',
                null,
                this.props.children
            );
        }
    }]);

    return Paragraph;
})(_react2['default'].Component);

function workspacesLocations(pydio, object) {
    var workspaces = [];
    if (!object.partOf || !object.partOf.items || !object.partOf.items.length) {
        return "No workspace found";
    }

    var _loop = function (i) {
        var ws = object.partOf.items[i];
        // Remove slug part
        //let paths = ws.rel.split('/');
        //paths.shift();
        //let relPath = paths.join('/');
        workspaces.push(_react2['default'].createElement(
            'a',
            { key: ws.id, onClick: function () {
                    return pydio.triggerRepositoryChange(ws.id);
                }, style: { cursor: 'pointer' } },
            ws.name
        ));
        workspaces.push(_react2['default'].createElement(
            'span',
            { key: ws.id + '-sep' },
            ', '
        ));
    };

    for (var i = 0; i < object.partOf.items.length; i++) {
        _loop(i);
    }
    workspaces.pop();
    return _react2['default'].createElement(
        'span',
        null,
        pydio.MessageHash['notification_center.16'],
        ' ',
        _react2['default'].createElement(
            'span',
            null,
            workspaces
        )
    );
}

function LinkWrapper(pydio, activity) {

    return _react2['default'].createClass({

        render: function render() {
            var _props = this.props;
            var href = _props.href;
            var children = _props.children;

            var title = "";
            var onClick = null;
            if (href.startsWith('doc://')) {
                if (activity.type === 'Delete') {
                    return _react2['default'].createElement(
                        'a',
                        { style: { textDecoration: 'line-through' } },
                        children
                    );
                } else {
                    return _react2['default'].createElement(
                        _DocLink2['default'],
                        { pydio: pydio, activity: activity },
                        children
                    );
                }
            } else if (href.startsWith('user://')) {
                var userId = href.replace('user://', '');
                return _react2['default'].createElement(UserAvatar, { userId: userId, displayAvatar: false, richOnClick: true, style: { cursor: 'pointer', display: 'inline-block', color: 'rgb(66, 140, 179)' }, pydio: pydio });
            } else if (href.startsWith('workspaces://')) {
                (function () {
                    var wsId = href.replace('workspaces://', '');
                    if (pydio.user && pydio.user.getRepositoriesList().get(wsId)) {
                        onClick = function () {
                            pydio.triggerRepositoryChange(wsId);
                        };
                    }
                })();
            }
            return _react2['default'].createElement(
                'a',
                { title: title, style: { cursor: 'pointer', color: 'rgb(66, 140, 179)' }, onClick: onClick },
                children
            );
        }
    });
}

var Activity = (function (_React$Component2) {
    _inherits(Activity, _React$Component2);

    function Activity() {
        _classCallCheck(this, Activity);

        _get(Object.getPrototypeOf(Activity.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Activity, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var activity = _props2.activity;
            var listContext = _props2.listContext;
            var displayContext = _props2.displayContext;
            var oneLiner = _props2.oneLiner;

            var secondary = activity.type + " - " + activity.actor.name;
            if (activity.summary) {
                secondary = _react2['default'].createElement(_reactMarkdown2['default'], { source: activity.summary, renderers: { 'paragraph': Paragraph, 'link': LinkWrapper(pydio, activity) } });
            }

            var avatar = _react2['default'].createElement(UserAvatar, {
                useDefaultAvatar: true,
                userId: activity.actor.id,
                userLabel: activity.actor.name,
                displayLocalLabel: true,
                userType: 'user',
                pydio: pydio,
                style: { display: 'flex', alignItems: 'center', maxWidth: '60%' },
                labelStyle: { fontSize: 14, paddingLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                avatarStyle: { flexShrink: 0 },
                avatarSize: 28,
                richOnHover: true
            });

            var summary = undefined;
            var actionIcon = undefined;
            var blockStyle = {
                margin: '0px 10px 6px'
            };
            var summaryStyle = {
                padding: '6px 22px 12px',
                marginTop: 6,
                borderRadius: 2,
                borderLeft: '2px solid #e0e0e0',
                marginLeft: 13,
                color: 'rgba(0,0,0,0.33)',
                fontWeight: 500,
                fontStyle: 'italic',
                overflow: 'hidden'
            };
            if (displayContext === 'popover') {
                summaryStyle = {
                    fontSize: 13,
                    color: 'rgba(0,0,0,0.33)',
                    fontWeight: 500,
                    margin: '6px 0',
                    padding: 6
                };
            }

            var className = '';
            var title = undefined;
            switch (activity.type) {
                case "Create":
                    if (activity.object.type === 'Document') {
                        className = "file-plus";
                    } else {
                        className = "folder-plus";
                    }
                    title = "Created";
                    break;
                case "Delete":
                    className = "delete";
                    title = "Deleted";
                    break;
                case "Edit":
                case "Update":
                    className = "pencil";
                    title = "Modified";
                    break;
                case "Read":
                    className = "eye";
                    title = "Accessed";
                    break;
                case "Move":
                    className = "file-send";
                    title = "Moved";
                    break;
                case "Share":
                    className = "share-variant";
                    if (activity.object.type === "Cell") {
                        className = "icomoon-cells";
                    } else if (activity.object.type === "Workspace") {
                        className = "folder";
                    }
                    title = "Shared";
                    break;
                default:
                    break;
            }
            if (className.indexOf('icomoon-') === -1) {
                className = 'mdi mdi-' + className;
            }
            if (listContext === 'NODE-LEAF') {
                blockStyle = { margin: '16px 10px' };
                actionIcon = _react2['default'].createElement(_materialUi.FontIcon, { className: className, title: title, style: { fontSize: 17, color: 'rgba(0,0,0,0.17)' } });
            } else {
                if (displayContext === 'mainList') {
                    return _react2['default'].createElement(_materialUi.ListItem, {
                        leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: className, color: 'rgba(0,0,0,.33)' }),
                        primaryText: secondary,
                        secondaryText: _react2['default'].createElement(
                            'div',
                            { style: { color: 'rgba(0,0,0,.33)' } },
                            workspacesLocations(pydio, activity.object)
                        ),
                        disabled: true
                    });
                } else if (displayContext === 'popover') {
                    var leftIcon = _react2['default'].createElement(_materialUi.FontIcon, { className: className, title: title, style: { padding: '0 8px', fontSize: 20, color: 'rgba(0,0,0,0.17)' } });
                    summary = _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'center' } },
                        leftIcon,
                        _react2['default'].createElement(
                            'div',
                            { style: _extends({}, summaryStyle, { flex: 1 }) },
                            secondary
                        )
                    );
                } else {
                    summary = _react2['default'].createElement(
                        'div',
                        { style: summaryStyle },
                        secondary
                    );
                }
            }

            return _react2['default'].createElement(
                'div',
                { style: blockStyle },
                !oneLiner && _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    avatar,
                    _react2['default'].createElement(
                        'span',
                        { style: { fontSize: 13, display: 'inline-block', flex: 1, height: 18, color: 'rgba(0,0,0,0.23)', fontWeight: 500, paddingLeft: 8, whiteSpace: 'nowrap' } },
                        moment(activity.updated).fromNow()
                    ),
                    actionIcon
                ),
                summary
            );
        }
    }]);

    return Activity;
})(_react2['default'].Component);

Activity.PropTypes = {
    activity: _react2['default'].PropTypes.object,
    listContext: _react2['default'].PropTypes.string,
    displayContext: _react2['default'].PropTypes.oneOf(['mainList', 'infoPanel', 'popover'])
};

exports['default'] = Activity = PydioContextConsumer(Activity);
exports['default'] = Activity;
module.exports = exports['default'];

},{"./DocLink":5,"material-ui":"material-ui","pydio":"pydio","react":"react","react-markdown":"react-markdown"}],2:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Client = require('./Client');

var _Client2 = _interopRequireDefault(_Client);

var _Activity = require('./Activity');

var _Activity2 = _interopRequireDefault(_Activity);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;
var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var EmptyStateView = _Pydio$requireLib2.EmptyStateView;

var ActivityList = (function (_React$Component) {
    _inherits(ActivityList, _React$Component);

    function ActivityList(props) {
        _classCallCheck(this, ActivityList);

        _get(Object.getPrototypeOf(ActivityList.prototype), 'constructor', this).call(this, props);
        if (props.items) {
            this.state = { data: { items: props.items }, offset: 0, loadMore: false, loading: false };
        } else {
            this.state = { data: [], offset: 0, loadMore: true, loading: false };
        }
    }

    _createClass(ActivityList, [{
        key: 'mergeMoreFeed',
        value: function mergeMoreFeed(currentFeed, newFeed) {
            var currentIds = currentFeed.items.map(function (item) {
                return item.id;
            });
            var filtered = newFeed.items.filter(function (item) {
                return currentIds.indexOf(item.id) === -1;
            });
            if (!filtered.length) {
                this.setState({ loadMore: false });
                return currentFeed;
            }
            var merged = currentFeed;
            merged.items = [].concat(_toConsumableArray(currentFeed.items), _toConsumableArray(filtered));
            merged.totalItems = merged.items.length;
            return merged;
        }
    }, {
        key: 'loadForProps',
        value: function loadForProps(props) {
            var _this = this;

            var context = props.context;
            var pointOfView = props.pointOfView;
            var contextData = props.contextData;
            var limit = props.limit;
            var _state = this.state;
            var offset = _state.offset;
            var data = _state.data;

            if (limit === undefined) {
                limit = -1;
            }
            if (offset > 0) {
                limit = 100;
            }
            this.setState({ loading: true });
            _Client2['default'].loadActivityStreams(function (json) {
                if (offset > 0 && data && data.items) {
                    if (json && json.items) _this.setState({ data: _this.mergeMoreFeed(data, json) });
                } else {
                    _this.setState({ data: json });
                }
                if (!json || !json.items || !json.items.length) {
                    _this.setState({ loadMore: false });
                }
                _this.setState({ loading: false });
            }, context, contextData, 'outbox', pointOfView, offset, limit);
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props;
            var items = _props.items;
            var contextData = _props.contextData;

            if (items) {
                return;
            }
            if (contextData) {
                this.loadForProps(this.props);
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this2 = this;

            if (nextProps.items) {
                this.setState({ data: { items: nextProps.items }, offset: 0, loadMore: false });
                return;
            }
            if (nextProps.contextData !== this.props.contextData || nextProps.context !== this.props.context) {
                this.setState({ offset: 0, loadMore: true }, function () {
                    _this2.loadForProps(nextProps);
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var content = [];
            var _state2 = this.state;
            var data = _state2.data;
            var loadMore = _state2.loadMore;
            var loading = _state2.loading;
            var _props2 = this.props;
            var listContext = _props2.listContext;
            var groupByDate = _props2.groupByDate;
            var displayContext = _props2.displayContext;
            var pydio = _props2.pydio;

            var previousFrom = undefined;
            if (data !== null && data.items) {
                data.items.forEach(function (ac) {

                    var fromNow = moment(ac.updated).fromNow();
                    if (groupByDate && fromNow !== previousFrom) {
                        content.push(_react2['default'].createElement(
                            'div',
                            { style: { padding: '0 16px', fontSize: 13, color: 'rgba(147, 168, 178, 0.67)', fontWeight: 500 } },
                            fromNow
                        ));
                    }
                    content.push(_react2['default'].createElement(_Activity2['default'], { key: ac.id, activity: ac, listContext: listContext, oneLiner: groupByDate, displayContext: displayContext }));
                    if (groupByDate) {
                        previousFrom = fromNow;
                    }
                });
            }
            if (content.length && loadMore) {
                var loadAction = function loadAction() {
                    _this3.setState({ offset: data.items.length + 1 }, function () {
                        _this3.loadForProps(_this3.props);
                    });
                };
                content.push(_react2['default'].createElement(
                    'div',
                    { style: { paddingLeft: 16 } },
                    _react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: loading ? pydio.MessageHash['notification_center.20'] : pydio.MessageHash['notification_center.19'], disabled: loading, onTouchTap: loadAction })
                ));
            }
            if (content.length) {
                return _react2['default'].createElement(
                    _materialUi.List,
                    { style: this.props.style },
                    content
                );
            } else {
                var style = { backgroundColor: 'transparent' };
                var iconStyle = undefined,
                    legendStyle = undefined;
                if (displayContext === 'popover') {
                    style = _extends({}, style, { minHeight: 250 });
                } else if (displayContext === 'infoPanel') {
                    style = _extends({}, style, { paddingBottom: 20 });
                    iconStyle = { fontSize: 40 };
                    legendStyle = { fontSize: 13, fontWeight: 400 };
                }
                return _react2['default'].createElement(EmptyStateView, {
                    pydio: this.props.pydio,
                    iconClassName: 'mdi mdi-pulse',
                    primaryTextId: loading ? pydio.MessageHash['notification_center.17'] : pydio.MessageHash['notification_center.18'],
                    style: style,
                    iconStyle: iconStyle,
                    legendStyle: legendStyle
                });
            }
        }
    }]);

    return ActivityList;
})(_react2['default'].Component);

ActivityList.PropTypes = {
    context: _react2['default'].PropTypes.string,
    contextData: _react2['default'].PropTypes.string,
    boxName: _react2['default'].PropTypes.string,
    pointOfView: _react2['default'].PropTypes.oneOf(['GENERIC', 'ACTOR', 'SUBJECT']),
    displayContext: _react2['default'].PropTypes.oneOf(['mainList', 'infoPanel', 'popover'])
};

exports['default'] = ActivityList = PydioContextConsumer(ActivityList);
exports['default'] = ActivityList;
module.exports = exports['default'];

},{"./Activity":1,"./Client":4,"material-ui":"material-ui","pydio":"pydio","react":"react"}],3:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'toggleWatch',
        value: function toggleWatch(manager, args) {

            if (args) {
                (function () {

                    var node = pydio.getUserSelection().getUniqueNode();
                    var nodeUuid = node.getMetadata().get('uuid');
                    var userId = pydio.user.id;
                    var subscription = new _pydioHttpRestApi.ActivitySubscription();
                    var type = new _pydioHttpRestApi.ActivityOwnerType();
                    subscription.UserId = userId;
                    subscription.ObjectId = nodeUuid;
                    subscription.ObjectType = type.NODE;
                    var events = [];
                    if (args === 'watch_change' || args === 'watch_both') {
                        events.push('change');
                    }
                    if (args === 'watch_read' || args === 'watch_both') {
                        events.push('read');
                    }
                    subscription.Events = events;
                    var api = new _pydioHttpRestApi.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
                    api.subscribe(subscription).then(function (outSub) {
                        var overlay = node.getMetadata().get('overlay_class') || '';
                        if (args === 'watch_stop') {
                            node.getMetadata()['delete']('meta_watched');
                            node.getMetadata().set('overlay_class', overlay.replace('mdi mdi-rss', ''));
                        } else {
                            node.getMetadata().set('meta_watched', 'META_' + args.toUpperCase());
                            var overlays = overlay.replace('mdi mdi-rss', '').split(',');
                            overlays.push('mdi mdi-rss');
                            node.getMetadata().set('overlay_class', overlays.join(','));
                        }
                        node.notify('node_replaced');
                    });
                })();
            }
        }
    }]);

    return Callbacks;
})();

exports['default'] = Callbacks;
module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],4:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var AS2Client = (function () {
    function AS2Client() {
        _classCallCheck(this, AS2Client);
    }

    _createClass(AS2Client, null, [{
        key: 'loadActivityStreams',
        value: function loadActivityStreams() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function (json) {} : arguments[0];
            var context = arguments.length <= 1 || arguments[1] === undefined ? 'USER_ID' : arguments[1];
            var contextData = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
            var boxName = arguments.length <= 3 || arguments[3] === undefined ? 'outbox' : arguments[3];
            var pointOfView = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
            var offset = arguments.length <= 5 || arguments[5] === undefined ? -1 : arguments[5];
            var limit = arguments.length <= 6 || arguments[6] === undefined ? -1 : arguments[6];

            if (!contextData) {
                return;
            }
            var api = new _pydioHttpRestApi.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
            var req = new _pydioHttpRestApi.ActivityStreamActivitiesRequest();
            req.Context = context;
            req.ContextData = contextData;
            req.BoxName = boxName;
            if (offset > -1) {
                req.Offset = offset;
            }
            if (limit > -1) {
                req.Limit = limit;
            }
            req.Language = pydio.user.getPreference("lang") || '';
            if (pointOfView) {
                req.PointOfView = pointOfView;
            }
            api.stream(req).then(function (data) {
                callback(data);
            });
        }
    }, {
        key: 'UnreadInbox',
        value: function UnreadInbox(userId) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function (count) {} : arguments[1];

            var api = new _pydioHttpRestApi.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
            var req = new _pydioHttpRestApi.ActivityStreamActivitiesRequest();
            req.Context = 'USER_ID';
            req.ContextData = userId;
            req.BoxName = 'inbox';
            req.UnreadCountOnly = true;
            api.stream(req).then(function (data) {
                var count = data.totalItems || 0;
                callback(count);
            });
        }
    }]);

    return AS2Client;
})();

exports['default'] = AS2Client;
module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],5:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _require = require('material-ui');

var Popover = _require.Popover;
var Paper = _require.Paper;
var IconButton = _require.IconButton;
var FlatButton = _require.FlatButton;
var Divider = _require.Divider;

var Pydio = require('pydio');
var debounce = require('lodash.debounce');
var MetaNodeProvider = require('pydio/model/meta-node-provider');

var _Pydio$requireLib = Pydio.requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var _Pydio$requireLib2 = Pydio.requireLib('workspaces');

var FilePreview = _Pydio$requireLib2.FilePreview;

function nodesFromObject(object, pydio) {
    var nodes = [];
    var currentRepository = pydio.user.getActiveRepository();
    if (!object.partOf || !object.partOf.items || !object.partOf.items.length) {
        return nodes;
    }
    for (var i = 0; i < object.partOf.items.length; i++) {
        var ws = object.partOf.items[i];
        // Remove slug part
        var paths = ws.rel.split('/');
        paths.shift();
        var relPath = paths.join('/');
        var node = new AjxpNode(relPath, object.type === 'Document');
        node.getMetadata().set('repository_id', ws.id);
        node.getMetadata().set('repository_label', ws.name);
        if (ws.id === currentRepository) {
            return [node];
        }
        nodes.push(node);
    }
    return nodes;
}

var DocPreview = (function (_React$Component) {
    _inherits(DocPreview, _React$Component);

    function DocPreview(props) {
        _classCallCheck(this, DocPreview);

        _get(Object.getPrototypeOf(DocPreview.prototype), 'constructor', this).call(this, props);
        var nodes = nodesFromObject(props.activity.object, props.pydio);
        if (nodes.length && !nodes[0].isLeaf()) {
            this.state = {
                previewLoaded: true,
                previewFailed: false,
                nodes: nodes
            };
        } else {
            this.state = {
                previewLoaded: false,
                previewFailed: false,
                nodes: nodes
            };
        }
    }

    _createClass(DocPreview, [{
        key: 'render',
        value: function render() {
            var _this = this;

            var pydio = this.props.pydio;
            var _state = this.state;
            var previewLoaded = _state.previewLoaded;
            var nodes = _state.nodes;
            var previewFailed = _state.previewFailed;

            var previewNode = nodes.length ? nodes[0] : null;
            var fPreview = undefined;
            var fPreviewLoading = undefined;
            var fPreviewStyle = {
                height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70
            };
            if (previewNode && previewNode.isLeaf()) {
                if (previewLoaded && !previewFailed) {
                    fPreview = _react2['default'].createElement(FilePreview, { style: fPreviewStyle,
                        node: previewNode, pydio: pydio, loadThumbnail: true,
                        richPreview: true, processing: !previewLoaded });
                } else if (previewLoaded && previewFailed) {

                    fPreview = _react2['default'].createElement(
                        'div',
                        { style: _extends({}, fPreviewStyle, { flexDirection: 'column' }), className: 'mimefont-container' },
                        _react2['default'].createElement('div', { className: 'mimefont mdi mdi-delete' }),
                        _react2['default'].createElement(
                            'span',
                            { style: { fontSize: 13 } },
                            'File deleted'
                        )
                    );
                } else {
                    (function () {
                        var nodeRepoId = previewNode.getMetadata().get('repository_id');
                        var nodeRepoLabel = previewNode.getMetadata().get('repository_label');
                        var provider = new MetaNodeProvider();
                        previewNode.observeOnce('error', function () {
                            _this.setState({ previewLoaded: true, previewFailed: true });
                        });
                        provider.loadLeafNodeSync(previewNode, function (loadedNode) {
                            loadedNode.getMetadata().set('repository_id', nodeRepoId);
                            loadedNode.getMetadata().set('repository_label', nodeRepoLabel);
                            nodes[0] = loadedNode;
                            _this.setState({ previewLoaded: true, nodes: nodes });
                        }, true, { tmp_repository_id: nodeRepoId });

                        fPreviewLoading = _react2['default'].createElement(FilePreview, { style: fPreviewStyle,
                            node: previewNode, pydio: pydio, loadThumbnail: false,
                            richPreview: false, processing: true });
                    })();
                }
            }

            var buttons = [];
            var currentRepoButton = undefined;
            var currentRepository = pydio.user.getActiveRepository();

            var _loop = function (i) {
                var node = nodes[i];
                var button = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', paddingLeft: 10 } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.33)' } },
                        pydio.MessageHash['notification_center.16'],
                        ' ',
                        node.getMetadata().get('repository_label')
                    ),
                    _react2['default'].createElement(IconButton, { iconClassName: "mdi mdi-open-in-new", tooltip: pydio.MessageHash['notification_center.6'], tooltipPosition: "top-center", onClick: function () {
                            pydio.goTo(node);
                        } })
                );
                if (node.getMetadata().get('repository_id') === currentRepository) {
                    currentRepoButton = _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'center' } },
                        _react2['default'].createElement('span', { style: { flex: 1 } }),
                        ' ',
                        _react2['default'].createElement(FlatButton, { label: pydio.MessageHash['notification_center.6'], iconClassName: "mdi mdi-open-in-new", tooltip: 'Open', tooltipPosition: "top-right", onClick: function () {
                                pydio.goTo(node);
                            } })
                    );
                    return 'break';
                }
                buttons.push(button);
                if (i < nodes.length - 1) {
                    buttons.push(_react2['default'].createElement(Divider, null));
                }
            };

            for (var i = 0; i < nodes.length; i++) {
                var _ret2 = _loop(i);

                if (_ret2 === 'break') break;
            }
            if (currentRepoButton) {
                buttons = [currentRepoButton];
            }

            return _react2['default'].createElement(
                'div',
                null,
                !previewFailed && _react2['default'].createElement(
                    'div',
                    { style: { padding: 6 } },
                    buttons
                )
            );
        }
    }]);

    return DocPreview;
})(_react2['default'].Component);

var DocLink = (function (_React$Component2) {
    _inherits(DocLink, _React$Component2);

    function DocLink(props) {
        _classCallCheck(this, DocLink);

        _get(Object.getPrototypeOf(DocLink.prototype), 'constructor', this).call(this, props);
        this.state = {
            showPopover: false,
            popoverAnchor: null
        };
    }

    _createClass(DocLink, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var activity = _props.activity;
            var children = _props.children;

            var nodes = nodesFromObject(activity.object, pydio);

            var onClick = undefined,
                onMouseOver = undefined,
                onMouseOut = undefined,
                popover = undefined;

            var pathParts = activity.object.name.replace('doc://', '').split('/');
            pathParts.shift();
            var title = '/' + pathParts.join('/');

            if (nodes.length > 1) {

                onClick = function () {
                    pydio.goTo(nodes[0]);
                };
                onMouseOut = debounce(function () {
                    _this2.setState({ showPopover: false });
                }, 350);
                onMouseOver = function (e) {
                    _this2.setState({ showPopover: true, popoverAnchor: e.currentTarget });
                    onMouseOut.cancel();
                };
                var onMouseOverInner = function onMouseOverInner(e) {
                    _this2.setState({ showPopover: true });
                    onMouseOut.cancel();
                };

                popover = _react2['default'].createElement(
                    Popover,
                    {
                        open: this.state.showPopover,
                        anchorEl: this.state.popoverAnchor,
                        onRequestClose: function (reason) {
                            if (reason !== 'clickAway') {
                                _this2.setState({ showPopover: false });
                            }
                        },
                        anchorOrigin: { horizontal: "left", vertical: "bottom" },
                        targetOrigin: { horizontal: "left", vertical: "top" },
                        useLayerForClickAway: false
                    },
                    _react2['default'].createElement(
                        Paper,
                        { zDepth: 2, style: { width: 200, height: 'auto', overflowY: 'auto' }, onMouseOver: onMouseOverInner, onMouseOut: onMouseOut },
                        _react2['default'].createElement(DocPreview, { pydio: pydio, activity: activity })
                    )
                );
            } else if (nodes.length === 1) {
                onClick = function () {
                    pydio.goTo(nodes[0]);
                };
            }

            return _react2['default'].createElement(
                'span',
                null,
                _react2['default'].createElement(
                    'a',
                    { title: title, style: { cursor: 'pointer', color: 'rgb(66, 140, 179)' },
                        onMouseOver: onMouseOver,
                        onMouseOut: onMouseOut,
                        onClick: onClick },
                    children
                ),
                popover
            );
        }
    }]);

    return DocLink;
})(_react2['default'].Component);

DocLink.PropTypes = {
    activity: _react2['default'].PropTypes.object,
    pydio: _react2['default'].PropTypes.instanceOf(Pydio)
};

exports['default'] = DocLink = PydioContextConsumer(DocLink);
exports['default'] = DocLink;
module.exports = exports['default'];

},{"lodash.debounce":"lodash.debounce","material-ui":"material-ui","pydio":"pydio","pydio/model/meta-node-provider":"pydio/model/meta-node-provider","react":"react"}],6:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _ActivityList = require('./ActivityList');

var _ActivityList2 = _interopRequireDefault(_ActivityList);

var _Pydio$requireLib = Pydio.requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var _Pydio$requireLib2 = Pydio.requireLib('workspaces');

var InfoPanelCard = _Pydio$requireLib2.InfoPanelCard;

var InfoPanel = (function (_React$Component) {
    _inherits(InfoPanel, _React$Component);

    function InfoPanel() {
        _classCallCheck(this, InfoPanel);

        _get(Object.getPrototypeOf(InfoPanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(InfoPanel, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var node = _props.node;
            var pydio = _props.pydio;

            if (pydio.getPluginConfigs("core.activitystreams").get("ACTIVITY_SHOW_ACTIVITIES") === false) {
                return null;
            }

            return _react2['default'].createElement(
                InfoPanelCard,
                { identifier: "activity", title: node.isLeaf() ? pydio.MessageHash['notification_center.11'] : pydio.MessageHash['notification_center.10'] },
                _react2['default'].createElement(_ActivityList2['default'], {
                    context: 'NODE_ID',
                    contextData: node.getMetadata().get('uuid'),
                    boxName: 'outbox',
                    style: { overflowY: 'scroll', maxHeight: 380 },
                    listContext: "NODE-" + (node.isLeaf() ? "LEAF" : "COLLECTION"),
                    pointOfView: "ACTOR",
                    displayContext: 'infoPanel'
                })
            );
        }
    }]);

    return InfoPanel;
})(_react2['default'].Component);

exports['default'] = InfoPanel = PydioContextConsumer(InfoPanel);
exports['default'] = InfoPanel;
module.exports = exports['default'];

},{"./ActivityList":2,"material-ui":"material-ui","react":"react"}],7:[function(require,module,exports){
(function (global){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Listeners = (function () {
    function Listeners() {
        _classCallCheck(this, Listeners);
    }

    _createClass(Listeners, null, [{
        key: "dynamicBuilder",
        value: function dynamicBuilder(controller) {
            var pydio = global.pydio;
            var MessageHash = pydio.MessageHash;

            var n = pydio.getUserSelection().getUniqueNode();
            if (!n) {
                return [];
            }

            var builderMenuItems = [];
            var metaValue = undefined;
            if (n.getMetadata().get("meta_watched")) {
                metaValue = n.getMetadata().get("meta_watched");
            }
            builderMenuItems.push({
                name: MessageHash["meta.watch.11"],
                alt: MessageHash["meta.watch." + (n.isLeaf() ? "12" : "12b")],
                isDefault: metaValue && metaValue == "META_WATCH_CHANGE",
                callback: (function (e) {
                    this.apply('watch_change');
                }).bind(this)
            });
            builderMenuItems.push({
                name: MessageHash["meta.watch.9"],
                alt: MessageHash["meta.watch." + (n.isLeaf() ? "10" : "10b")],
                isDefault: metaValue && metaValue == "META_WATCH_READ",
                callback: (function (e) {
                    this.apply('watch_read');
                }).bind(this)
            });
            builderMenuItems.push({
                name: MessageHash["meta.watch.13"],
                alt: MessageHash["meta.watch." + (n.isLeaf() ? "14" : "14b")],
                isDefault: metaValue && metaValue == "META_WATCH_BOTH",
                callback: (function (e) {
                    this.apply('watch_both');
                }).bind(this)
            });
            if (metaValue) {
                builderMenuItems.push({
                    separator: true
                });
                builderMenuItems.push({
                    name: MessageHash['meta.watch.3'],
                    alt: MessageHash["meta.watch." + (n.isLeaf() ? "8" : "4")],
                    isDefault: false,
                    callback: (function (e) {
                        this.apply('watch_stop');
                    }).bind(this)
                });
            }

            return builderMenuItems;
        }
    }]);

    return Listeners;
})();

exports["default"] = Listeners;
module.exports = exports["default"];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _Client = require('./Client');

var _Client2 = _interopRequireDefault(_Client);

var _ActivityList = require('./ActivityList');

var _ActivityList2 = _interopRequireDefault(_ActivityList);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var UserPanel = (function (_React$Component) {
    _inherits(UserPanel, _React$Component);

    function UserPanel(props) {
        _classCallCheck(this, UserPanel);

        _get(Object.getPrototypeOf(UserPanel.prototype), 'constructor', this).call(this, props);
        this.state = {
            unreadStatus: 0,
            open: false,
            data: []
        };
        this.reloadData = (0, _lodashDebounce2['default'])(this.reloadData.bind(this), 500);
        this.reloadUnread = (0, _lodashDebounce2['default'])(this.reloadUnread.bind(this), 500);
    }

    _createClass(UserPanel, [{
        key: 'reloadData',
        value: function reloadData() {
            var _this = this;

            _Client2['default'].loadActivityStreams(function (json) {
                _this.setState({ data: json });
            }, 'USER_ID', this.props.pydio.user.id, 'inbox');
        }
    }, {
        key: 'reloadUnread',
        value: function reloadUnread() {
            var _this2 = this;

            _Client2['default'].UnreadInbox(this.props.pydio.user.id, function (count) {
                _this2.setState({ unreadStatus: count });
            });
        }
    }, {
        key: 'onStatusChange',
        value: function onStatusChange() {
            if (this.props.onUnreadStatusChange) {
                this.props.onUnreadStatusChange(this.state.unreadStatus);
            }
        }
    }, {
        key: 'handleTouchTap',
        value: function handleTouchTap(event) {
            // This prevents ghost click.
            event.preventDefault();
            //if(this.state.unreadStatus){
            //this.updateAlertsLastRead();
            //}
            this.reloadData();
            this.setState({
                open: true,
                anchorEl: event.currentTarget,
                unreadStatus: 0
            }, this.onStatusChange.bind(this));
        }
    }, {
        key: 'handleRequestClose',
        value: function handleRequestClose() {
            this.setState({
                open: false
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this3 = this;

            this.reloadUnread();
            this.props.pydio.observe('websocket_event:activity', function (event) {
                if (_this3.state.open) {
                    _this3.reloadData();
                } else {
                    _this3.reloadUnread();
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var iconStyle = _props.iconStyle;
            var _state = this.state;
            var open = _state.open;
            var anchorEl = _state.anchorEl;

            var buttonStyle = { borderRadius: '50%' };
            if (open && iconStyle && iconStyle.color) {
                buttonStyle = _extends({}, buttonStyle, { backgroundColor: (0, _color2['default'])(iconStyle.color).fade(0.9).toString() });
            }
            return _react2['default'].createElement(
                'span',
                null,
                _react2['default'].createElement(
                    _materialUi.Badge,
                    {
                        badgeContent: this.state.unreadStatus,
                        secondary: true,
                        style: this.state.unreadStatus ? { padding: '0 24px 0 0' } : { padding: 0 },
                        badgeStyle: this.state.unreadStatus ? null : { display: 'none' }
                    },
                    _react2['default'].createElement(_materialUi.IconButton, {
                        onTouchTap: this.handleTouchTap.bind(this),
                        iconClassName: this.props.iconClassName || "icon-bell",
                        tooltip: this.props.pydio.MessageHash['notification_center.4'],
                        className: 'userActionButton alertsButton',
                        iconStyle: iconStyle,
                        style: buttonStyle
                    })
                ),
                _react2['default'].createElement(
                    _materialUi.Popover,
                    {
                        open: open,
                        anchorEl: anchorEl,
                        anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                        targetOrigin: { horizontal: 'left', vertical: 'top' },
                        onRequestClose: this.handleRequestClose.bind(this),
                        style: { width: 320 },
                        zDepth: 2

                    },
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'center', borderRadius: '2px 2px 0 0', padding: '12px 16px', width: '100%',
                                backgroundColor: 'rgb(238, 238, 238)', borderBottom: '1px solid rgb(224, 224, 224)' } },
                        pydio.MessageHash['notification_center.1']
                    ),
                    this.state.data && _react2['default'].createElement(_ActivityList2['default'], {
                        items: this.state.data.items,
                        style: { overflowY: 'scroll', maxHeight: 330, paddingTop: 20 },
                        groupByDate: true,
                        displayContext: "popover"
                    })
                )
            );
        }
    }]);

    return UserPanel;
})(_react2['default'].Component);

exports['default'] = UserPanel;
module.exports = exports['default'];

},{"./ActivityList":2,"./Client":4,"color":"color","lodash.debounce":"lodash.debounce","material-ui":"material-ui","react":"react"}],9:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj["default"] : obj; }

var _InfoPanel = require("./InfoPanel");

exports.InfoPanel = _interopRequire(_InfoPanel);

var _UserPanel = require("./UserPanel");

exports.UserPanel = _interopRequire(_UserPanel);

var _Client = require("./Client");

exports.ASClient = _interopRequire(_Client);

var _Activity = require("./Activity");

exports.Activity = _interopRequire(_Activity);

var _ActivityList = require("./ActivityList");

exports.ActivityList = _interopRequire(_ActivityList);

var _Listener = require('./Listener');

exports.Listener = _interopRequire(_Listener);

var _Callbacks = require('./Callbacks');

exports.Callbacks = _interopRequire(_Callbacks);

},{"./Activity":1,"./ActivityList":2,"./Callbacks":3,"./Client":4,"./InfoPanel":6,"./Listener":7,"./UserPanel":8}]},{},[9])(9)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvQWN0aXZpdHkuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvQWN0aXZpdHlMaXN0LmpzIiwicmVzL2J1aWxkL1B5ZGlvQWN0aXZpdHlTdHJlYW1zL0NhbGxiYWNrcy5qcyIsInJlcy9idWlsZC9QeWRpb0FjdGl2aXR5U3RyZWFtcy9DbGllbnQuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvRG9jTGluay5qcyIsInJlcy9idWlsZC9QeWRpb0FjdGl2aXR5U3RyZWFtcy9JbmZvUGFuZWwuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvTGlzdGVuZXIuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvVXNlclBhbmVsLmpzIiwicmVzL2J1aWxkL1B5ZGlvQWN0aXZpdHlTdHJlYW1zL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3JlYWN0TWFya2Rvd24gPSByZXF1aXJlKCdyZWFjdC1tYXJrZG93bicpO1xuXG52YXIgX3JlYWN0TWFya2Rvd24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3RNYXJrZG93bik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfRG9jTGluayA9IHJlcXVpcmUoJy4vRG9jTGluaycpO1xuXG52YXIgX0RvY0xpbmsyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRG9jTGluayk7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBVc2VyQXZhdGFyID0gX3JlcXVpcmUkcmVxdWlyZUxpYi5Vc2VyQXZhdGFyO1xuXG52YXIgX3JlcXVpcmUkcmVxdWlyZUxpYjIgPSByZXF1aXJlKCdweWRpbycpLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIFB5ZGlvQ29udGV4dENvbnN1bWVyID0gX3JlcXVpcmUkcmVxdWlyZUxpYjIuUHlkaW9Db250ZXh0Q29uc3VtZXI7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIG1vbWVudCA9IF9QeWRpbyRyZXF1aXJlTGliLm1vbWVudDtcblxudmFyIFBhcmFncmFwaCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhQYXJhZ3JhcGgsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUGFyYWdyYXBoKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGFyYWdyYXBoKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihQYXJhZ3JhcGgucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUGFyYWdyYXBoLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUGFyYWdyYXBoO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmZ1bmN0aW9uIHdvcmtzcGFjZXNMb2NhdGlvbnMocHlkaW8sIG9iamVjdCkge1xuICAgIHZhciB3b3Jrc3BhY2VzID0gW107XG4gICAgaWYgKCFvYmplY3QucGFydE9mIHx8ICFvYmplY3QucGFydE9mLml0ZW1zIHx8ICFvYmplY3QucGFydE9mLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gXCJObyB3b3Jrc3BhY2UgZm91bmRcIjtcbiAgICB9XG5cbiAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICB2YXIgd3MgPSBvYmplY3QucGFydE9mLml0ZW1zW2ldO1xuICAgICAgICAvLyBSZW1vdmUgc2x1ZyBwYXJ0XG4gICAgICAgIC8vbGV0IHBhdGhzID0gd3MucmVsLnNwbGl0KCcvJyk7XG4gICAgICAgIC8vcGF0aHMuc2hpZnQoKTtcbiAgICAgICAgLy9sZXQgcmVsUGF0aCA9IHBhdGhzLmpvaW4oJy8nKTtcbiAgICAgICAgd29ya3NwYWNlcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgeyBrZXk6IHdzLmlkLCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBweWRpby50cmlnZ2VyUmVwb3NpdG9yeUNoYW5nZSh3cy5pZCk7XG4gICAgICAgICAgICAgICAgfSwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicgfSB9LFxuICAgICAgICAgICAgd3MubmFtZVxuICAgICAgICApKTtcbiAgICAgICAgd29ya3NwYWNlcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgeyBrZXk6IHdzLmlkICsgJy1zZXAnIH0sXG4gICAgICAgICAgICAnLCAnXG4gICAgICAgICkpO1xuICAgIH07XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iamVjdC5wYXJ0T2YuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgX2xvb3AoaSk7XG4gICAgfVxuICAgIHdvcmtzcGFjZXMucG9wKCk7XG4gICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnc3BhbicsXG4gICAgICAgIG51bGwsXG4gICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWydub3RpZmljYXRpb25fY2VudGVyLjE2J10sXG4gICAgICAgICcgJyxcbiAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgd29ya3NwYWNlc1xuICAgICAgICApXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gTGlua1dyYXBwZXIocHlkaW8sIGFjdGl2aXR5KSB7XG5cbiAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGhyZWYgPSBfcHJvcHMuaHJlZjtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IF9wcm9wcy5jaGlsZHJlbjtcblxuICAgICAgICAgICAgdmFyIHRpdGxlID0gXCJcIjtcbiAgICAgICAgICAgIHZhciBvbkNsaWNrID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJ2RvYzovLycpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09ICdEZWxldGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dERlY29yYXRpb246ICdsaW5lLXRocm91Z2gnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX0RvY0xpbmsyWydkZWZhdWx0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHB5ZGlvOiBweWRpbywgYWN0aXZpdHk6IGFjdGl2aXR5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaHJlZi5zdGFydHNXaXRoKCd1c2VyOi8vJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgdXNlcklkID0gaHJlZi5yZXBsYWNlKCd1c2VyOi8vJywgJycpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2VyQXZhdGFyLCB7IHVzZXJJZDogdXNlcklkLCBkaXNwbGF5QXZhdGFyOiBmYWxzZSwgcmljaE9uQ2xpY2s6IHRydWUsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgY29sb3I6ICdyZ2IoNjYsIDE0MCwgMTc5KScgfSwgcHlkaW86IHB5ZGlvIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChocmVmLnN0YXJ0c1dpdGgoJ3dvcmtzcGFjZXM6Ly8nKSkge1xuICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3c0lkID0gaHJlZi5yZXBsYWNlKCd3b3Jrc3BhY2VzOi8vJywgJycpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHlkaW8udXNlciAmJiBweWRpby51c2VyLmdldFJlcG9zaXRvcmllc0xpc3QoKS5nZXQod3NJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8udHJpZ2dlclJlcG9zaXRvcnlDaGFuZ2Uod3NJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnYScsXG4gICAgICAgICAgICAgICAgeyB0aXRsZTogdGl0bGUsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBjb2xvcjogJ3JnYig2NiwgMTQwLCAxNzkpJyB9LCBvbkNsaWNrOiBvbkNsaWNrIH0sXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxudmFyIEFjdGl2aXR5ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mikge1xuICAgIF9pbmhlcml0cyhBY3Rpdml0eSwgX1JlYWN0JENvbXBvbmVudDIpO1xuXG4gICAgZnVuY3Rpb24gQWN0aXZpdHkoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBY3Rpdml0eSk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQWN0aXZpdHkucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQWN0aXZpdHksIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGFjdGl2aXR5ID0gX3Byb3BzMi5hY3Rpdml0eTtcbiAgICAgICAgICAgIHZhciBsaXN0Q29udGV4dCA9IF9wcm9wczIubGlzdENvbnRleHQ7XG4gICAgICAgICAgICB2YXIgZGlzcGxheUNvbnRleHQgPSBfcHJvcHMyLmRpc3BsYXlDb250ZXh0O1xuICAgICAgICAgICAgdmFyIG9uZUxpbmVyID0gX3Byb3BzMi5vbmVMaW5lcjtcblxuICAgICAgICAgICAgdmFyIHNlY29uZGFyeSA9IGFjdGl2aXR5LnR5cGUgKyBcIiAtIFwiICsgYWN0aXZpdHkuYWN0b3IubmFtZTtcbiAgICAgICAgICAgIGlmIChhY3Rpdml0eS5zdW1tYXJ5KSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX3JlYWN0TWFya2Rvd24yWydkZWZhdWx0J10sIHsgc291cmNlOiBhY3Rpdml0eS5zdW1tYXJ5LCByZW5kZXJlcnM6IHsgJ3BhcmFncmFwaCc6IFBhcmFncmFwaCwgJ2xpbmsnOiBMaW5rV3JhcHBlcihweWRpbywgYWN0aXZpdHkpIH0gfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBhdmF0YXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2VyQXZhdGFyLCB7XG4gICAgICAgICAgICAgICAgdXNlRGVmYXVsdEF2YXRhcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICB1c2VySWQ6IGFjdGl2aXR5LmFjdG9yLmlkLFxuICAgICAgICAgICAgICAgIHVzZXJMYWJlbDogYWN0aXZpdHkuYWN0b3IubmFtZSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TG9jYWxMYWJlbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB1c2VyVHlwZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXhXaWR0aDogJzYwJScgfSxcbiAgICAgICAgICAgICAgICBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCwgcGFkZGluZ0xlZnQ6IDEwLCBvdmVyZmxvdzogJ2hpZGRlbicsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJywgd2hpdGVTcGFjZTogJ25vd3JhcCcgfSxcbiAgICAgICAgICAgICAgICBhdmF0YXJTdHlsZTogeyBmbGV4U2hyaW5rOiAwIH0sXG4gICAgICAgICAgICAgICAgYXZhdGFyU2l6ZTogMjgsXG4gICAgICAgICAgICAgICAgcmljaE9uSG92ZXI6IHRydWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgc3VtbWFyeSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBhY3Rpb25JY29uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGJsb2NrU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAnMHB4IDEwcHggNnB4J1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBzdW1tYXJ5U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzZweCAyMnB4IDEycHgnLFxuICAgICAgICAgICAgICAgIG1hcmdpblRvcDogNixcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDIsXG4gICAgICAgICAgICAgICAgYm9yZGVyTGVmdDogJzJweCBzb2xpZCAjZTBlMGUwJyxcbiAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAxMyxcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMCwwLDAsMC4zMyknLFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgICAgICAgICAgICBmb250U3R5bGU6ICdpdGFsaWMnLFxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChkaXNwbGF5Q29udGV4dCA9PT0gJ3BvcG92ZXInKSB7XG4gICAgICAgICAgICAgICAgc3VtbWFyeVN0eWxlID0ge1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLDAsMCwwLjMzKScsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnNnB4IDAnLFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiA2XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9ICcnO1xuICAgICAgICAgICAgdmFyIHRpdGxlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpdml0eS50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNyZWF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZpdHkub2JqZWN0LnR5cGUgPT09ICdEb2N1bWVudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiZmlsZS1wbHVzXCI7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBcImZvbGRlci1wbHVzXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBcIkNyZWF0ZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRlbGV0ZVwiOlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBcImRlbGV0ZVwiO1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IFwiRGVsZXRlZFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRWRpdFwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJVcGRhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gXCJwZW5jaWxcIjtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBcIk1vZGlmaWVkXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSZWFkXCI6XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiZXllXCI7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gXCJBY2Nlc3NlZFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTW92ZVwiOlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBcImZpbGUtc2VuZFwiO1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IFwiTW92ZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNoYXJlXCI6XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwic2hhcmUtdmFyaWFudFwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZpdHkub2JqZWN0LnR5cGUgPT09IFwiQ2VsbFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBcImljb21vb24tY2VsbHNcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpdml0eS5vYmplY3QudHlwZSA9PT0gXCJXb3Jrc3BhY2VcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gXCJmb2xkZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IFwiU2hhcmVkXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCdpY29tb29uLScpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9ICdtZGkgbWRpLScgKyBjbGFzc05hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGlzdENvbnRleHQgPT09ICdOT0RFLUxFQUYnKSB7XG4gICAgICAgICAgICAgICAgYmxvY2tTdHlsZSA9IHsgbWFyZ2luOiAnMTZweCAxMHB4JyB9O1xuICAgICAgICAgICAgICAgIGFjdGlvbkljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSwgdGl0bGU6IHRpdGxlLCBzdHlsZTogeyBmb250U2l6ZTogMTcsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjE3KScgfSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlDb250ZXh0ID09PSAnbWFpbkxpc3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5MaXN0SXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdEljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCBjb2xvcjogJ3JnYmEoMCwwLDAsLjMzKScgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dDogc2Vjb25kYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5VGV4dDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsLjMzKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZXNMb2NhdGlvbnMocHlkaW8sIGFjdGl2aXR5Lm9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRpc3BsYXlDb250ZXh0ID09PSAncG9wb3ZlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxlZnRJY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIHRpdGxlOiB0aXRsZSwgc3R5bGU6IHsgcGFkZGluZzogJzAgOHB4JywgZm9udFNpemU6IDIwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC4xNyknIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcnkgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnRJY29uLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoe30sIHN1bW1hcnlTdHlsZSwgeyBmbGV4OiAxIH0pIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdW1tYXJ5U3R5bGUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IGJsb2NrU3R5bGUgfSxcbiAgICAgICAgICAgICAgICAhb25lTGluZXIgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICBhdmF0YXIsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBmbGV4OiAxLCBoZWlnaHQ6IDE4LCBjb2xvcjogJ3JnYmEoMCwwLDAsMC4yMyknLCBmb250V2VpZ2h0OiA1MDAsIHBhZGRpbmdMZWZ0OiA4LCB3aGl0ZVNwYWNlOiAnbm93cmFwJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtb21lbnQoYWN0aXZpdHkudXBkYXRlZCkuZnJvbU5vdygpXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkljb25cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHN1bW1hcnlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQWN0aXZpdHk7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuQWN0aXZpdHkuUHJvcFR5cGVzID0ge1xuICAgIGFjdGl2aXR5OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICBsaXN0Q29udGV4dDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgZGlzcGxheUNvbnRleHQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub25lT2YoWydtYWluTGlzdCcsICdpbmZvUGFuZWwnLCAncG9wb3ZlciddKVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQWN0aXZpdHkgPSBQeWRpb0NvbnRleHRDb25zdW1lcihBY3Rpdml0eSk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBBY3Rpdml0eTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycjJbaV0gPSBhcnJbaV07IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX0NsaWVudCA9IHJlcXVpcmUoJy4vQ2xpZW50Jyk7XG5cbnZhciBfQ2xpZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NsaWVudCk7XG5cbnZhciBfQWN0aXZpdHkgPSByZXF1aXJlKCcuL0FjdGl2aXR5Jyk7XG5cbnZhciBfQWN0aXZpdHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQWN0aXZpdHkpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgUHlkaW9Db250ZXh0Q29uc3VtZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5QeWRpb0NvbnRleHRDb25zdW1lcjtcbnZhciBtb21lbnQgPSBfUHlkaW8kcmVxdWlyZUxpYi5tb21lbnQ7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignY29tcG9uZW50cycpO1xuXG52YXIgRW1wdHlTdGF0ZVZpZXcgPSBfUHlkaW8kcmVxdWlyZUxpYjIuRW1wdHlTdGF0ZVZpZXc7XG5cbnZhciBBY3Rpdml0eUxpc3QgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQWN0aXZpdHlMaXN0LCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEFjdGl2aXR5TGlzdChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQWN0aXZpdHlMaXN0KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihBY3Rpdml0eUxpc3QucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIGlmIChwcm9wcy5pdGVtcykge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHsgZGF0YTogeyBpdGVtczogcHJvcHMuaXRlbXMgfSwgb2Zmc2V0OiAwLCBsb2FkTW9yZTogZmFsc2UsIGxvYWRpbmc6IGZhbHNlIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0geyBkYXRhOiBbXSwgb2Zmc2V0OiAwLCBsb2FkTW9yZTogdHJ1ZSwgbG9hZGluZzogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhBY3Rpdml0eUxpc3QsIFt7XG4gICAgICAgIGtleTogJ21lcmdlTW9yZUZlZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbWVyZ2VNb3JlRmVlZChjdXJyZW50RmVlZCwgbmV3RmVlZCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRJZHMgPSBjdXJyZW50RmVlZC5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5pZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gbmV3RmVlZC5pdGVtcy5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudElkcy5pbmRleE9mKGl0ZW0uaWQpID09PSAtMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFmaWx0ZXJlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZE1vcmU6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50RmVlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtZXJnZWQgPSBjdXJyZW50RmVlZDtcbiAgICAgICAgICAgIG1lcmdlZC5pdGVtcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoY3VycmVudEZlZWQuaXRlbXMpLCBfdG9Db25zdW1hYmxlQXJyYXkoZmlsdGVyZWQpKTtcbiAgICAgICAgICAgIG1lcmdlZC50b3RhbEl0ZW1zID0gbWVyZ2VkLml0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWRGb3JQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkRm9yUHJvcHMocHJvcHMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gcHJvcHMuY29udGV4dDtcbiAgICAgICAgICAgIHZhciBwb2ludE9mVmlldyA9IHByb3BzLnBvaW50T2ZWaWV3O1xuICAgICAgICAgICAgdmFyIGNvbnRleHREYXRhID0gcHJvcHMuY29udGV4dERhdGE7XG4gICAgICAgICAgICB2YXIgbGltaXQgPSBwcm9wcy5saW1pdDtcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9IF9zdGF0ZS5vZmZzZXQ7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IF9zdGF0ZS5kYXRhO1xuXG4gICAgICAgICAgICBpZiAobGltaXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxpbWl0ID0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2Zmc2V0ID4gMCkge1xuICAgICAgICAgICAgICAgIGxpbWl0ID0gMTAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG4gICAgICAgICAgICBfQ2xpZW50MlsnZGVmYXVsdCddLmxvYWRBY3Rpdml0eVN0cmVhbXMoZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0ID4gMCAmJiBkYXRhICYmIGRhdGEuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24gJiYganNvbi5pdGVtcykgX3RoaXMuc2V0U3RhdGUoeyBkYXRhOiBfdGhpcy5tZXJnZU1vcmVGZWVkKGRhdGEsIGpzb24pIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgZGF0YToganNvbiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFqc29uIHx8ICFqc29uLml0ZW1zIHx8ICFqc29uLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxvYWRNb3JlOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH0sIGNvbnRleHQsIGNvbnRleHREYXRhLCAnb3V0Ym94JywgcG9pbnRPZlZpZXcsIG9mZnNldCwgbGltaXQpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBfcHJvcHMuaXRlbXM7XG4gICAgICAgICAgICB2YXIgY29udGV4dERhdGEgPSBfcHJvcHMuY29udGV4dERhdGE7XG5cbiAgICAgICAgICAgIGlmIChpdGVtcykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb250ZXh0RGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEZvclByb3BzKHRoaXMucHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKG5leHRQcm9wcy5pdGVtcykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkYXRhOiB7IGl0ZW1zOiBuZXh0UHJvcHMuaXRlbXMgfSwgb2Zmc2V0OiAwLCBsb2FkTW9yZTogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5leHRQcm9wcy5jb250ZXh0RGF0YSAhPT0gdGhpcy5wcm9wcy5jb250ZXh0RGF0YSB8fCBuZXh0UHJvcHMuY29udGV4dCAhPT0gdGhpcy5wcm9wcy5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG9mZnNldDogMCwgbG9hZE1vcmU6IHRydWUgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIubG9hZEZvclByb3BzKG5leHRQcm9wcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBbXTtcbiAgICAgICAgICAgIHZhciBfc3RhdGUyID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBkYXRhID0gX3N0YXRlMi5kYXRhO1xuICAgICAgICAgICAgdmFyIGxvYWRNb3JlID0gX3N0YXRlMi5sb2FkTW9yZTtcbiAgICAgICAgICAgIHZhciBsb2FkaW5nID0gX3N0YXRlMi5sb2FkaW5nO1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGxpc3RDb250ZXh0ID0gX3Byb3BzMi5saXN0Q29udGV4dDtcbiAgICAgICAgICAgIHZhciBncm91cEJ5RGF0ZSA9IF9wcm9wczIuZ3JvdXBCeURhdGU7XG4gICAgICAgICAgICB2YXIgZGlzcGxheUNvbnRleHQgPSBfcHJvcHMyLmRpc3BsYXlDb250ZXh0O1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcblxuICAgICAgICAgICAgdmFyIHByZXZpb3VzRnJvbSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChkYXRhICE9PSBudWxsICYmIGRhdGEuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBkYXRhLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGFjKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGZyb21Ob3cgPSBtb21lbnQoYWMudXBkYXRlZCkuZnJvbU5vdygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeURhdGUgJiYgZnJvbU5vdyAhPT0gcHJldmlvdXNGcm9tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCAxNnB4JywgZm9udFNpemU6IDEzLCBjb2xvcjogJ3JnYmEoMTQ3LCAxNjgsIDE3OCwgMC42NyknLCBmb250V2VpZ2h0OiA1MDAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21Ob3dcbiAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfQWN0aXZpdHkyWydkZWZhdWx0J10sIHsga2V5OiBhYy5pZCwgYWN0aXZpdHk6IGFjLCBsaXN0Q29udGV4dDogbGlzdENvbnRleHQsIG9uZUxpbmVyOiBncm91cEJ5RGF0ZSwgZGlzcGxheUNvbnRleHQ6IGRpc3BsYXlDb250ZXh0IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3VwQnlEYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0Zyb20gPSBmcm9tTm93O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29udGVudC5sZW5ndGggJiYgbG9hZE1vcmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9hZEFjdGlvbiA9IGZ1bmN0aW9uIGxvYWRBY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IG9mZnNldDogZGF0YS5pdGVtcy5sZW5ndGggKyAxIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5sb2FkRm9yUHJvcHMoX3RoaXMzLnByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb250ZW50LnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAxNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IGxvYWRpbmcgPyBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci4yMCddIDogcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMTknXSwgZGlzYWJsZWQ6IGxvYWRpbmcsIG9uVG91Y2hUYXA6IGxvYWRBY3Rpb24gfSlcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogdGhpcy5wcm9wcy5zdHlsZSB9LFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlID0geyBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcgfTtcbiAgICAgICAgICAgICAgICB2YXIgaWNvblN0eWxlID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRTdHlsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUNvbnRleHQgPT09ICdwb3BvdmVyJykge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZSA9IF9leHRlbmRzKHt9LCBzdHlsZSwgeyBtaW5IZWlnaHQ6IDI1MCB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRpc3BsYXlDb250ZXh0ID09PSAnaW5mb1BhbmVsJykge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZSA9IF9leHRlbmRzKHt9LCBzdHlsZSwgeyBwYWRkaW5nQm90dG9tOiAyMCB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlID0geyBmb250U2l6ZTogNDAgfTtcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kU3R5bGUgPSB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNDAwIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChFbXB0eVN0YXRlVmlldywge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogdGhpcy5wcm9wcy5weWRpbyxcbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktcHVsc2UnLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dElkOiBsb2FkaW5nID8gcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMTcnXSA6IHB5ZGlvLk1lc3NhZ2VIYXNoWydub3RpZmljYXRpb25fY2VudGVyLjE4J10sXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBzdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlOiBpY29uU3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZFN0eWxlOiBsZWdlbmRTdHlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEFjdGl2aXR5TGlzdDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5BY3Rpdml0eUxpc3QuUHJvcFR5cGVzID0ge1xuICAgIGNvbnRleHQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIGNvbnRleHREYXRhOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICBib3hOYW1lOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICBwb2ludE9mVmlldzogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vbmVPZihbJ0dFTkVSSUMnLCAnQUNUT1InLCAnU1VCSkVDVCddKSxcbiAgICBkaXNwbGF5Q29udGV4dDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vbmVPZihbJ21haW5MaXN0JywgJ2luZm9QYW5lbCcsICdwb3BvdmVyJ10pXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBBY3Rpdml0eUxpc3QgPSBQeWRpb0NvbnRleHRDb25zdW1lcihBY3Rpdml0eUxpc3QpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gQWN0aXZpdHlMaXN0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxOCBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ3RvZ2dsZVdhdGNoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRvZ2dsZVdhdGNoKG1hbmFnZXIsIGFyZ3MpIHtcblxuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gcHlkaW8uZ2V0VXNlclNlbGVjdGlvbigpLmdldFVuaXF1ZU5vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVVdWlkID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXNlcklkID0gcHlkaW8udXNlci5pZDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5BY3Rpdml0eVN1YnNjcmlwdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5BY3Rpdml0eU93bmVyVHlwZSgpO1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uVXNlcklkID0gdXNlcklkO1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uT2JqZWN0SWQgPSBub2RlVXVpZDtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLk9iamVjdFR5cGUgPSB0eXBlLk5PREU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBldmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MgPT09ICd3YXRjaF9jaGFuZ2UnIHx8IGFyZ3MgPT09ICd3YXRjaF9ib3RoJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnB1c2goJ2NoYW5nZScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdzID09PSAnd2F0Y2hfcmVhZCcgfHwgYXJncyA9PT0gJ3dhdGNoX2JvdGgnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMucHVzaCgncmVhZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5FdmVudHMgPSBldmVudHM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuQWN0aXZpdHlTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnN1YnNjcmliZShzdWJzY3JpcHRpb24pLnRoZW4oZnVuY3Rpb24gKG91dFN1Yikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG92ZXJsYXkgPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdvdmVybGF5X2NsYXNzJykgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJncyA9PT0gJ3dhdGNoX3N0b3AnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpWydkZWxldGUnXSgnbWV0YV93YXRjaGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgnb3ZlcmxheV9jbGFzcycsIG92ZXJsYXkucmVwbGFjZSgnbWRpIG1kaS1yc3MnLCAnJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KCdtZXRhX3dhdGNoZWQnLCAnTUVUQV8nICsgYXJncy50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3ZlcmxheXMgPSBvdmVybGF5LnJlcGxhY2UoJ21kaSBtZGktcnNzJywgJycpLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmxheXMucHVzaCgnbWRpIG1kaS1yc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KCdvdmVybGF5X2NsYXNzJywgb3ZlcmxheXMuam9pbignLCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubm90aWZ5KCdub2RlX3JlcGxhY2VkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ2FsbGJhY2tzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBBUzJDbGllbnQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFTMkNsaWVudCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEFTMkNsaWVudCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEFTMkNsaWVudCwgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnbG9hZEFjdGl2aXR5U3RyZWFtcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkQWN0aXZpdHlTdHJlYW1zKCkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKGpzb24pIHt9IDogYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnVVNFUl9JRCcgOiBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICB2YXIgY29udGV4dERhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAnJyA6IGFyZ3VtZW50c1syXTtcbiAgICAgICAgICAgIHZhciBib3hOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gJ291dGJveCcgOiBhcmd1bWVudHNbM107XG4gICAgICAgICAgICB2YXIgcG9pbnRPZlZpZXcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDQgfHwgYXJndW1lbnRzWzRdID09PSB1bmRlZmluZWQgPyAnJyA6IGFyZ3VtZW50c1s0XTtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDUgfHwgYXJndW1lbnRzWzVdID09PSB1bmRlZmluZWQgPyAtMSA6IGFyZ3VtZW50c1s1XTtcbiAgICAgICAgICAgIHZhciBsaW1pdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNiB8fCBhcmd1bWVudHNbNl0gPT09IHVuZGVmaW5lZCA/IC0xIDogYXJndW1lbnRzWzZdO1xuXG4gICAgICAgICAgICBpZiAoIWNvbnRleHREYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5BY3Rpdml0eVNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgdmFyIHJlcSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5BY3Rpdml0eVN0cmVhbUFjdGl2aXRpZXNSZXF1ZXN0KCk7XG4gICAgICAgICAgICByZXEuQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICByZXEuQ29udGV4dERhdGEgPSBjb250ZXh0RGF0YTtcbiAgICAgICAgICAgIHJlcS5Cb3hOYW1lID0gYm94TmFtZTtcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJlcS5PZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGltaXQgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJlcS5MaW1pdCA9IGxpbWl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxLkxhbmd1YWdlID0gcHlkaW8udXNlci5nZXRQcmVmZXJlbmNlKFwibGFuZ1wiKSB8fCAnJztcbiAgICAgICAgICAgIGlmIChwb2ludE9mVmlldykge1xuICAgICAgICAgICAgICAgIHJlcS5Qb2ludE9mVmlldyA9IHBvaW50T2ZWaWV3O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXBpLnN0cmVhbShyZXEpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdVbnJlYWRJbmJveCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBVbnJlYWRJbmJveCh1c2VySWQpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uIChjb3VudCkge30gOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuQWN0aXZpdHlTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHZhciByZXEgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuQWN0aXZpdHlTdHJlYW1BY3Rpdml0aWVzUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxLkNvbnRleHQgPSAnVVNFUl9JRCc7XG4gICAgICAgICAgICByZXEuQ29udGV4dERhdGEgPSB1c2VySWQ7XG4gICAgICAgICAgICByZXEuQm94TmFtZSA9ICdpbmJveCc7XG4gICAgICAgICAgICByZXEuVW5yZWFkQ291bnRPbmx5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGFwaS5zdHJlYW0ocmVxKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gZGF0YS50b3RhbEl0ZW1zIHx8IDA7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soY291bnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQVMyQ2xpZW50O1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQVMyQ2xpZW50O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBQb3BvdmVyID0gX3JlcXVpcmUuUG9wb3ZlcjtcbnZhciBQYXBlciA9IF9yZXF1aXJlLlBhcGVyO1xudmFyIEljb25CdXR0b24gPSBfcmVxdWlyZS5JY29uQnV0dG9uO1xudmFyIEZsYXRCdXR0b24gPSBfcmVxdWlyZS5GbGF0QnV0dG9uO1xudmFyIERpdmlkZXIgPSBfcmVxdWlyZS5EaXZpZGVyO1xuXG52YXIgUHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoLmRlYm91bmNlJyk7XG52YXIgTWV0YU5vZGVQcm92aWRlciA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL21ldGEtbm9kZS1wcm92aWRlcicpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBQeWRpby5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBQeWRpb0NvbnRleHRDb25zdW1lciA9IF9QeWRpbyRyZXF1aXJlTGliLlB5ZGlvQ29udGV4dENvbnN1bWVyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIyID0gUHlkaW8ucmVxdWlyZUxpYignd29ya3NwYWNlcycpO1xuXG52YXIgRmlsZVByZXZpZXcgPSBfUHlkaW8kcmVxdWlyZUxpYjIuRmlsZVByZXZpZXc7XG5cbmZ1bmN0aW9uIG5vZGVzRnJvbU9iamVjdChvYmplY3QsIHB5ZGlvKSB7XG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgdmFyIGN1cnJlbnRSZXBvc2l0b3J5ID0gcHlkaW8udXNlci5nZXRBY3RpdmVSZXBvc2l0b3J5KCk7XG4gICAgaWYgKCFvYmplY3QucGFydE9mIHx8ICFvYmplY3QucGFydE9mLml0ZW1zIHx8ICFvYmplY3QucGFydE9mLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqZWN0LnBhcnRPZi5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgd3MgPSBvYmplY3QucGFydE9mLml0ZW1zW2ldO1xuICAgICAgICAvLyBSZW1vdmUgc2x1ZyBwYXJ0XG4gICAgICAgIHZhciBwYXRocyA9IHdzLnJlbC5zcGxpdCgnLycpO1xuICAgICAgICBwYXRocy5zaGlmdCgpO1xuICAgICAgICB2YXIgcmVsUGF0aCA9IHBhdGhzLmpvaW4oJy8nKTtcbiAgICAgICAgdmFyIG5vZGUgPSBuZXcgQWp4cE5vZGUocmVsUGF0aCwgb2JqZWN0LnR5cGUgPT09ICdEb2N1bWVudCcpO1xuICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2lkJywgd3MuaWQpO1xuICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2xhYmVsJywgd3MubmFtZSk7XG4gICAgICAgIGlmICh3cy5pZCA9PT0gY3VycmVudFJlcG9zaXRvcnkpIHtcbiAgICAgICAgICAgIHJldHVybiBbbm9kZV07XG4gICAgICAgIH1cbiAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzO1xufVxuXG52YXIgRG9jUHJldmlldyA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhEb2NQcmV2aWV3LCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIERvY1ByZXZpZXcocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERvY1ByZXZpZXcpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKERvY1ByZXZpZXcucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHZhciBub2RlcyA9IG5vZGVzRnJvbU9iamVjdChwcm9wcy5hY3Rpdml0eS5vYmplY3QsIHByb3BzLnB5ZGlvKTtcbiAgICAgICAgaWYgKG5vZGVzLmxlbmd0aCAmJiAhbm9kZXNbMF0uaXNMZWFmKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgcHJldmlld0xvYWRlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwcmV2aWV3RmFpbGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub2Rlczogbm9kZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgICAgIHByZXZpZXdMb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByZXZpZXdGYWlsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG5vZGVzOiBub2Rlc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhEb2NQcmV2aWV3LCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIHByZXZpZXdMb2FkZWQgPSBfc3RhdGUucHJldmlld0xvYWRlZDtcbiAgICAgICAgICAgIHZhciBub2RlcyA9IF9zdGF0ZS5ub2RlcztcbiAgICAgICAgICAgIHZhciBwcmV2aWV3RmFpbGVkID0gX3N0YXRlLnByZXZpZXdGYWlsZWQ7XG5cbiAgICAgICAgICAgIHZhciBwcmV2aWV3Tm9kZSA9IG5vZGVzLmxlbmd0aCA/IG5vZGVzWzBdIDogbnVsbDtcbiAgICAgICAgICAgIHZhciBmUHJldmlldyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBmUHJldmlld0xvYWRpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgZlByZXZpZXdTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDIwMCwgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBmb250U2l6ZTogNzBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocHJldmlld05vZGUgJiYgcHJldmlld05vZGUuaXNMZWFmKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlld0xvYWRlZCAmJiAhcHJldmlld0ZhaWxlZCkge1xuICAgICAgICAgICAgICAgICAgICBmUHJldmlldyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEZpbGVQcmV2aWV3LCB7IHN0eWxlOiBmUHJldmlld1N0eWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogcHJldmlld05vZGUsIHB5ZGlvOiBweWRpbywgbG9hZFRodW1ibmFpbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpY2hQcmV2aWV3OiB0cnVlLCBwcm9jZXNzaW5nOiAhcHJldmlld0xvYWRlZCB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByZXZpZXdMb2FkZWQgJiYgcHJldmlld0ZhaWxlZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGZQcmV2aWV3ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHt9LCBmUHJldmlld1N0eWxlLCB7IGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIH0pLCBjbGFzc05hbWU6ICdtaW1lZm9udC1jb250YWluZXInIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdtaW1lZm9udCBtZGkgbWRpLWRlbGV0ZScgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGaWxlIGRlbGV0ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlUmVwb0lkID0gcHJldmlld05vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3JlcG9zaXRvcnlfaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlUmVwb0xhYmVsID0gcHJldmlld05vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3JlcG9zaXRvcnlfbGFiZWwnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm92aWRlciA9IG5ldyBNZXRhTm9kZVByb3ZpZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aWV3Tm9kZS5vYnNlcnZlT25jZSgnZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBwcmV2aWV3TG9hZGVkOiB0cnVlLCBwcmV2aWV3RmFpbGVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlci5sb2FkTGVhZk5vZGVTeW5jKHByZXZpZXdOb2RlLCBmdW5jdGlvbiAobG9hZGVkTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZE5vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoJ3JlcG9zaXRvcnlfaWQnLCBub2RlUmVwb0lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZWROb2RlLmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2xhYmVsJywgbm9kZVJlcG9MYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbMF0gPSBsb2FkZWROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgcHJldmlld0xvYWRlZDogdHJ1ZSwgbm9kZXM6IG5vZGVzIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdHJ1ZSwgeyB0bXBfcmVwb3NpdG9yeV9pZDogbm9kZVJlcG9JZCB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZlByZXZpZXdMb2FkaW5nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRmlsZVByZXZpZXcsIHsgc3R5bGU6IGZQcmV2aWV3U3R5bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogcHJldmlld05vZGUsIHB5ZGlvOiBweWRpbywgbG9hZFRodW1ibmFpbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmljaFByZXZpZXc6IGZhbHNlLCBwcm9jZXNzaW5nOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50UmVwb0J1dHRvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBjdXJyZW50UmVwb3NpdG9yeSA9IHB5ZGlvLnVzZXIuZ2V0QWN0aXZlUmVwb3NpdG9yeSgpO1xuXG4gICAgICAgICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICAgICAgdmFyIGJ1dHRvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBwYWRkaW5nTGVmdDogMTAgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuMzMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci4xNiddLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgncmVwb3NpdG9yeV9sYWJlbCcpXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLW9wZW4taW4tbmV3XCIsIHRvb2x0aXA6IHB5ZGlvLk1lc3NhZ2VIYXNoWydub3RpZmljYXRpb25fY2VudGVyLjYnXSwgdG9vbHRpcFBvc2l0aW9uOiBcInRvcC1jZW50ZXJcIiwgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdvVG8obm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5nZXRNZXRhZGF0YSgpLmdldCgncmVwb3NpdG9yeV9pZCcpID09PSBjdXJyZW50UmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UmVwb0J1dHRvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEZsYXRCdXR0b24sIHsgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydub3RpZmljYXRpb25fY2VudGVyLjYnXSwgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLW9wZW4taW4tbmV3XCIsIHRvb2x0aXA6ICdPcGVuJywgdG9vbHRpcFBvc2l0aW9uOiBcInRvcC1yaWdodFwiLCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdvVG8obm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2JyZWFrJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBub2Rlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChEaXZpZGVyLCBudWxsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBfcmV0MiA9IF9sb29wKGkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF9yZXQyID09PSAnYnJlYWsnKSBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdXJyZW50UmVwb0J1dHRvbikge1xuICAgICAgICAgICAgICAgIGJ1dHRvbnMgPSBbY3VycmVudFJlcG9CdXR0b25dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAhcHJldmlld0ZhaWxlZCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIERvY1ByZXZpZXc7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIERvY0xpbmsgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKERvY0xpbmssIF9SZWFjdCRDb21wb25lbnQyKTtcblxuICAgIGZ1bmN0aW9uIERvY0xpbmsocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERvY0xpbmspO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKERvY0xpbmsucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaG93UG9wb3ZlcjogZmFsc2UsXG4gICAgICAgICAgICBwb3BvdmVyQW5jaG9yOiBudWxsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKERvY0xpbmssIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgYWN0aXZpdHkgPSBfcHJvcHMuYWN0aXZpdHk7XG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBfcHJvcHMuY2hpbGRyZW47XG5cbiAgICAgICAgICAgIHZhciBub2RlcyA9IG5vZGVzRnJvbU9iamVjdChhY3Rpdml0eS5vYmplY3QsIHB5ZGlvKTtcblxuICAgICAgICAgICAgdmFyIG9uQ2xpY2sgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgb25Nb3VzZU92ZXIgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgb25Nb3VzZU91dCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBwb3BvdmVyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB2YXIgcGF0aFBhcnRzID0gYWN0aXZpdHkub2JqZWN0Lm5hbWUucmVwbGFjZSgnZG9jOi8vJywgJycpLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBwYXRoUGFydHMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciB0aXRsZSA9ICcvJyArIHBhdGhQYXJ0cy5qb2luKCcvJyk7XG5cbiAgICAgICAgICAgIGlmIChub2Rlcy5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgICAgICAgICBvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBweWRpby5nb1RvKG5vZGVzWzBdKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9uTW91c2VPdXQgPSBkZWJvdW5jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHNob3dQb3BvdmVyOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICB9LCAzNTApO1xuICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgc2hvd1BvcG92ZXI6IHRydWUsIHBvcG92ZXJBbmNob3I6IGUuY3VycmVudFRhcmdldCB9KTtcbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU91dC5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBvbk1vdXNlT3ZlcklubmVyID0gZnVuY3Rpb24gb25Nb3VzZU92ZXJJbm5lcihlKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHNob3dQb3BvdmVyOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3V0LmNhbmNlbCgpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBwb3BvdmVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFBvcG92ZXIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMuc3RhdGUuc2hvd1BvcG92ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogdGhpcy5zdGF0ZS5wb3BvdmVyQW5jaG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0Q2xvc2U6IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVhc29uICE9PSAnY2xpY2tBd2F5Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBzaG93UG9wb3ZlcjogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiBcImxlZnRcIiwgdmVydGljYWw6IFwiYm90dG9tXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiBcImxlZnRcIiwgdmVydGljYWw6IFwidG9wXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZUxheWVyRm9yQ2xpY2tBd2F5OiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIFBhcGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB6RGVwdGg6IDIsIHN0eWxlOiB7IHdpZHRoOiAyMDAsIGhlaWdodDogJ2F1dG8nLCBvdmVyZmxvd1k6ICdhdXRvJyB9LCBvbk1vdXNlT3Zlcjogb25Nb3VzZU92ZXJJbm5lciwgb25Nb3VzZU91dDogb25Nb3VzZU91dCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRG9jUHJldmlldywgeyBweWRpbzogcHlkaW8sIGFjdGl2aXR5OiBhY3Rpdml0eSB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgb25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ29Ubyhub2Rlc1swXSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnYScsXG4gICAgICAgICAgICAgICAgICAgIHsgdGl0bGU6IHRpdGxlLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6ICdyZ2IoNjYsIDE0MCwgMTc5KScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyOiBvbk1vdXNlT3ZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdXQ6IG9uTW91c2VPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiBvbkNsaWNrIH0sXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBwb3BvdmVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIERvY0xpbms7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuRG9jTGluay5Qcm9wVHlwZXMgPSB7XG4gICAgYWN0aXZpdHk6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIHB5ZGlvOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoUHlkaW8pXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBEb2NMaW5rID0gUHlkaW9Db250ZXh0Q29uc3VtZXIoRG9jTGluayk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBEb2NMaW5rO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX0FjdGl2aXR5TGlzdCA9IHJlcXVpcmUoJy4vQWN0aXZpdHlMaXN0Jyk7XG5cbnZhciBfQWN0aXZpdHlMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0FjdGl2aXR5TGlzdCk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIFB5ZGlvQ29udGV4dENvbnN1bWVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuUHlkaW9Db250ZXh0Q29uc3VtZXI7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBQeWRpby5yZXF1aXJlTGliKCd3b3Jrc3BhY2VzJyk7XG5cbnZhciBJbmZvUGFuZWxDYXJkID0gX1B5ZGlvJHJlcXVpcmVMaWIyLkluZm9QYW5lbENhcmQ7XG5cbnZhciBJbmZvUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoSW5mb1BhbmVsLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEluZm9QYW5lbCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEluZm9QYW5lbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoSW5mb1BhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEluZm9QYW5lbCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICAgICAgaWYgKHB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoXCJjb3JlLmFjdGl2aXR5c3RyZWFtc1wiKS5nZXQoXCJBQ1RJVklUWV9TSE9XX0FDVElWSVRJRVNcIikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBJbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgIHsgaWRlbnRpZmllcjogXCJhY3Rpdml0eVwiLCB0aXRsZTogbm9kZS5pc0xlYWYoKSA/IHB5ZGlvLk1lc3NhZ2VIYXNoWydub3RpZmljYXRpb25fY2VudGVyLjExJ10gOiBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci4xMCddIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX0FjdGl2aXR5TGlzdDJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnTk9ERV9JRCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHREYXRhOiBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd1dWlkJyksXG4gICAgICAgICAgICAgICAgICAgIGJveE5hbWU6ICdvdXRib3gnLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBvdmVyZmxvd1k6ICdzY3JvbGwnLCBtYXhIZWlnaHQ6IDM4MCB9LFxuICAgICAgICAgICAgICAgICAgICBsaXN0Q29udGV4dDogXCJOT0RFLVwiICsgKG5vZGUuaXNMZWFmKCkgPyBcIkxFQUZcIiA6IFwiQ09MTEVDVElPTlwiKSxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRPZlZpZXc6IFwiQUNUT1JcIixcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheUNvbnRleHQ6ICdpbmZvUGFuZWwnXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW5mb1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEluZm9QYW5lbCA9IFB5ZGlvQ29udGV4dENvbnN1bWVyKEluZm9QYW5lbCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBJbmZvUGFuZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE4IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIExpc3RlbmVycyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTGlzdGVuZXJzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTGlzdGVuZXJzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTGlzdGVuZXJzLCBudWxsLCBbe1xuICAgICAgICBrZXk6IFwiZHluYW1pY0J1aWxkZXJcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGR5bmFtaWNCdWlsZGVyKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IGdsb2JhbC5weWRpbztcbiAgICAgICAgICAgIHZhciBNZXNzYWdlSGFzaCA9IHB5ZGlvLk1lc3NhZ2VIYXNoO1xuXG4gICAgICAgICAgICB2YXIgbiA9IHB5ZGlvLmdldFVzZXJTZWxlY3Rpb24oKS5nZXRVbmlxdWVOb2RlKCk7XG4gICAgICAgICAgICBpZiAoIW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBidWlsZGVyTWVudUl0ZW1zID0gW107XG4gICAgICAgICAgICB2YXIgbWV0YVZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG4uZ2V0TWV0YWRhdGEoKS5nZXQoXCJtZXRhX3dhdGNoZWRcIikpIHtcbiAgICAgICAgICAgICAgICBtZXRhVmFsdWUgPSBuLmdldE1ldGFkYXRhKCkuZ2V0KFwibWV0YV93YXRjaGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnVpbGRlck1lbnVJdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBNZXNzYWdlSGFzaFtcIm1ldGEud2F0Y2guMTFcIl0sXG4gICAgICAgICAgICAgICAgYWx0OiBNZXNzYWdlSGFzaFtcIm1ldGEud2F0Y2guXCIgKyAobi5pc0xlYWYoKSA/IFwiMTJcIiA6IFwiMTJiXCIpXSxcbiAgICAgICAgICAgICAgICBpc0RlZmF1bHQ6IG1ldGFWYWx1ZSAmJiBtZXRhVmFsdWUgPT0gXCJNRVRBX1dBVENIX0NIQU5HRVwiLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseSgnd2F0Y2hfY2hhbmdlJyk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBidWlsZGVyTWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IE1lc3NhZ2VIYXNoW1wibWV0YS53YXRjaC45XCJdLFxuICAgICAgICAgICAgICAgIGFsdDogTWVzc2FnZUhhc2hbXCJtZXRhLndhdGNoLlwiICsgKG4uaXNMZWFmKCkgPyBcIjEwXCIgOiBcIjEwYlwiKV0sXG4gICAgICAgICAgICAgICAgaXNEZWZhdWx0OiBtZXRhVmFsdWUgJiYgbWV0YVZhbHVlID09IFwiTUVUQV9XQVRDSF9SRUFEXCIsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5KCd3YXRjaF9yZWFkJyk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBidWlsZGVyTWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IE1lc3NhZ2VIYXNoW1wibWV0YS53YXRjaC4xM1wiXSxcbiAgICAgICAgICAgICAgICBhbHQ6IE1lc3NhZ2VIYXNoW1wibWV0YS53YXRjaC5cIiArIChuLmlzTGVhZigpID8gXCIxNFwiIDogXCIxNGJcIildLFxuICAgICAgICAgICAgICAgIGlzRGVmYXVsdDogbWV0YVZhbHVlICYmIG1ldGFWYWx1ZSA9PSBcIk1FVEFfV0FUQ0hfQk9USFwiLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseSgnd2F0Y2hfYm90aCcpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG1ldGFWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGJ1aWxkZXJNZW51SXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHNlcGFyYXRvcjogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJ1aWxkZXJNZW51SXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IE1lc3NhZ2VIYXNoWydtZXRhLndhdGNoLjMnXSxcbiAgICAgICAgICAgICAgICAgICAgYWx0OiBNZXNzYWdlSGFzaFtcIm1ldGEud2F0Y2guXCIgKyAobi5pc0xlYWYoKSA/IFwiOFwiIDogXCI0XCIpXSxcbiAgICAgICAgICAgICAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseSgnd2F0Y2hfc3RvcCcpO1xuICAgICAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBidWlsZGVyTWVudUl0ZW1zO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIExpc3RlbmVycztcbn0pKCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gTGlzdGVuZXJzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE5IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfQ2xpZW50ID0gcmVxdWlyZSgnLi9DbGllbnQnKTtcblxudmFyIF9DbGllbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ2xpZW50KTtcblxudmFyIF9BY3Rpdml0eUxpc3QgPSByZXF1aXJlKCcuL0FjdGl2aXR5TGlzdCcpO1xuXG52YXIgX0FjdGl2aXR5TGlzdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9BY3Rpdml0eUxpc3QpO1xuXG52YXIgX2xvZGFzaERlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoLmRlYm91bmNlJyk7XG5cbnZhciBfbG9kYXNoRGVib3VuY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9kYXNoRGVib3VuY2UpO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZSgnY29sb3InKTtcblxudmFyIF9jb2xvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb2xvcik7XG5cbnZhciBVc2VyUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVXNlclBhbmVsLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFVzZXJQYW5lbChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXNlclBhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihVc2VyUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB1bnJlYWRTdGF0dXM6IDAsXG4gICAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IFtdXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmVsb2FkRGF0YSA9ICgwLCBfbG9kYXNoRGVib3VuY2UyWydkZWZhdWx0J10pKHRoaXMucmVsb2FkRGF0YS5iaW5kKHRoaXMpLCA1MDApO1xuICAgICAgICB0aGlzLnJlbG9hZFVucmVhZCA9ICgwLCBfbG9kYXNoRGVib3VuY2UyWydkZWZhdWx0J10pKHRoaXMucmVsb2FkVW5yZWFkLmJpbmQodGhpcyksIDUwMCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFVzZXJQYW5lbCwgW3tcbiAgICAgICAga2V5OiAncmVsb2FkRGF0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZWxvYWREYXRhKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgX0NsaWVudDJbJ2RlZmF1bHQnXS5sb2FkQWN0aXZpdHlTdHJlYW1zKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBkYXRhOiBqc29uIH0pO1xuICAgICAgICAgICAgfSwgJ1VTRVJfSUQnLCB0aGlzLnByb3BzLnB5ZGlvLnVzZXIuaWQsICdpbmJveCcpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZWxvYWRVbnJlYWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVsb2FkVW5yZWFkKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIF9DbGllbnQyWydkZWZhdWx0J10uVW5yZWFkSW5ib3godGhpcy5wcm9wcy5weWRpby51c2VyLmlkLCBmdW5jdGlvbiAoY291bnQpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyB1bnJlYWRTdGF0dXM6IGNvdW50IH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uU3RhdHVzQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uU3RhdHVzQ2hhbmdlKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25VbnJlYWRTdGF0dXNDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uVW5yZWFkU3RhdHVzQ2hhbmdlKHRoaXMuc3RhdGUudW5yZWFkU3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaGFuZGxlVG91Y2hUYXAnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlVG91Y2hUYXAoZXZlbnQpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgZ2hvc3QgY2xpY2suXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgLy9pZih0aGlzLnN0YXRlLnVucmVhZFN0YXR1cyl7XG4gICAgICAgICAgICAvL3RoaXMudXBkYXRlQWxlcnRzTGFzdFJlYWQoKTtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICAgICAgdGhpcy5yZWxvYWREYXRhKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICAgICAgICAgIGFuY2hvckVsOiBldmVudC5jdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgIHVucmVhZFN0YXR1czogMFxuICAgICAgICAgICAgfSwgdGhpcy5vblN0YXR1c0NoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaGFuZGxlUmVxdWVzdENsb3NlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3RDbG9zZSgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIG9wZW46IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLnJlbG9hZFVucmVhZCgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5vYnNlcnZlKCd3ZWJzb2NrZXRfZXZlbnQ6YWN0aXZpdHknLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMzLnN0YXRlLm9wZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbG9hZERhdGEoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMucmVsb2FkVW5yZWFkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBpY29uU3R5bGUgPSBfcHJvcHMuaWNvblN0eWxlO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgb3BlbiA9IF9zdGF0ZS5vcGVuO1xuICAgICAgICAgICAgdmFyIGFuY2hvckVsID0gX3N0YXRlLmFuY2hvckVsO1xuXG4gICAgICAgICAgICB2YXIgYnV0dG9uU3R5bGUgPSB7IGJvcmRlclJhZGl1czogJzUwJScgfTtcbiAgICAgICAgICAgIGlmIChvcGVuICYmIGljb25TdHlsZSAmJiBpY29uU3R5bGUuY29sb3IpIHtcbiAgICAgICAgICAgICAgICBidXR0b25TdHlsZSA9IF9leHRlbmRzKHt9LCBidXR0b25TdHlsZSwgeyBiYWNrZ3JvdW5kQ29sb3I6ICgwLCBfY29sb3IyWydkZWZhdWx0J10pKGljb25TdHlsZS5jb2xvcikuZmFkZSgwLjkpLnRvU3RyaW5nKCkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkJhZGdlLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWRnZUNvbnRlbnQ6IHRoaXMuc3RhdGUudW5yZWFkU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHRoaXMuc3RhdGUudW5yZWFkU3RhdHVzID8geyBwYWRkaW5nOiAnMCAyNHB4IDAgMCcgfSA6IHsgcGFkZGluZzogMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYmFkZ2VTdHlsZTogdGhpcy5zdGF0ZS51bnJlYWRTdGF0dXMgPyBudWxsIDogeyBkaXNwbGF5OiAnbm9uZScgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiB0aGlzLmhhbmRsZVRvdWNoVGFwLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lOiB0aGlzLnByb3BzLmljb25DbGFzc05hbWUgfHwgXCJpY29uLWJlbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuNCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAndXNlckFjdGlvbkJ1dHRvbiBhbGVydHNCdXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlOiBpY29uU3R5bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogYnV0dG9uU3R5bGVcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiBvcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IGFuY2hvckVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVxdWVzdENsb3NlOiB0aGlzLmhhbmRsZVJlcXVlc3RDbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6IDMyMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgekRlcHRoOiAyXG5cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgYm9yZGVyUmFkaXVzOiAnMnB4IDJweCAwIDAnLCBwYWRkaW5nOiAnMTJweCAxNnB4Jywgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiKDIzOCwgMjM4LCAyMzgpJywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkIHJnYigyMjQsIDIyNCwgMjI0KScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMSddXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZGF0YSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfQWN0aXZpdHlMaXN0MlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5zdGF0ZS5kYXRhLml0ZW1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgb3ZlcmZsb3dZOiAnc2Nyb2xsJywgbWF4SGVpZ2h0OiAzMzAsIHBhZGRpbmdUb3A6IDIwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cEJ5RGF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlDb250ZXh0OiBcInBvcG92ZXJcIlxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXNlclBhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFVzZXJQYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqW1wiZGVmYXVsdFwiXSA6IG9iajsgfVxuXG52YXIgX0luZm9QYW5lbCA9IHJlcXVpcmUoXCIuL0luZm9QYW5lbFwiKTtcblxuZXhwb3J0cy5JbmZvUGFuZWwgPSBfaW50ZXJvcFJlcXVpcmUoX0luZm9QYW5lbCk7XG5cbnZhciBfVXNlclBhbmVsID0gcmVxdWlyZShcIi4vVXNlclBhbmVsXCIpO1xuXG5leHBvcnRzLlVzZXJQYW5lbCA9IF9pbnRlcm9wUmVxdWlyZShfVXNlclBhbmVsKTtcblxudmFyIF9DbGllbnQgPSByZXF1aXJlKFwiLi9DbGllbnRcIik7XG5cbmV4cG9ydHMuQVNDbGllbnQgPSBfaW50ZXJvcFJlcXVpcmUoX0NsaWVudCk7XG5cbnZhciBfQWN0aXZpdHkgPSByZXF1aXJlKFwiLi9BY3Rpdml0eVwiKTtcblxuZXhwb3J0cy5BY3Rpdml0eSA9IF9pbnRlcm9wUmVxdWlyZShfQWN0aXZpdHkpO1xuXG52YXIgX0FjdGl2aXR5TGlzdCA9IHJlcXVpcmUoXCIuL0FjdGl2aXR5TGlzdFwiKTtcblxuZXhwb3J0cy5BY3Rpdml0eUxpc3QgPSBfaW50ZXJvcFJlcXVpcmUoX0FjdGl2aXR5TGlzdCk7XG5cbnZhciBfTGlzdGVuZXIgPSByZXF1aXJlKCcuL0xpc3RlbmVyJyk7XG5cbmV4cG9ydHMuTGlzdGVuZXIgPSBfaW50ZXJvcFJlcXVpcmUoX0xpc3RlbmVyKTtcblxudmFyIF9DYWxsYmFja3MgPSByZXF1aXJlKCcuL0NhbGxiYWNrcycpO1xuXG5leHBvcnRzLkNhbGxiYWNrcyA9IF9pbnRlcm9wUmVxdWlyZShfQ2FsbGJhY2tzKTtcbiJdfQ==
