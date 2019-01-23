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

            var className = undefined;
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
                default:
                    break;
            }
            if (listContext === 'NODE-LEAF') {
                blockStyle = { margin: '16px 10px' };
                actionIcon = _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-" + className, title: title, style: { fontSize: 17, color: 'rgba(0,0,0,0.17)' } });
            } else {
                if (displayContext === 'mainList') {
                    return _react2['default'].createElement(_materialUi.ListItem, {
                        leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-" + className, color: 'rgba(0,0,0,.33)' }),
                        primaryText: secondary,
                        secondaryText: _react2['default'].createElement(
                            'div',
                            { style: { color: 'rgba(0,0,0,.33)' } },
                            workspacesLocations(pydio, activity.object)
                        ),
                        disabled: true
                    });
                } else if (displayContext === 'popover') {
                    var leftIcon = _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-" + className, title: title, style: { padding: '0 8px', fontSize: 20, color: 'rgba(0,0,0,0.17)' } });
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
                    style = { minHeight: 250 };
                } else if (displayContext === 'infoPanel') {
                    style = { backgroundColor: 'transparent', paddingBottom: 20 };
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

var _Client = require('./Client');

var _Client2 = _interopRequireDefault(_Client);

var _ActivityList = require('./ActivityList');

var _ActivityList2 = _interopRequireDefault(_ActivityList);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

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
                        iconStyle: this.props.iconStyle
                    })
                ),
                _react2['default'].createElement(
                    _materialUi.Popover,
                    {
                        open: this.state.open,
                        anchorEl: this.state.anchorEl,
                        anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                        targetOrigin: { horizontal: 'left', vertical: 'top' },
                        onRequestClose: this.handleRequestClose.bind(this),
                        style: { width: 320 },
                        zDepth: 2

                    },
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

},{"./ActivityList":2,"./Client":4,"lodash.debounce":"lodash.debounce","material-ui":"material-ui","react":"react"}],9:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvQWN0aXZpdHkuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvQWN0aXZpdHlMaXN0LmpzIiwicmVzL2J1aWxkL1B5ZGlvQWN0aXZpdHlTdHJlYW1zL0NhbGxiYWNrcy5qcyIsInJlcy9idWlsZC9QeWRpb0FjdGl2aXR5U3RyZWFtcy9DbGllbnQuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvRG9jTGluay5qcyIsInJlcy9idWlsZC9QeWRpb0FjdGl2aXR5U3RyZWFtcy9JbmZvUGFuZWwuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvTGlzdGVuZXIuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvVXNlclBhbmVsLmpzIiwicmVzL2J1aWxkL1B5ZGlvQWN0aXZpdHlTdHJlYW1zL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3RNYXJrZG93biA9IHJlcXVpcmUoJ3JlYWN0LW1hcmtkb3duJyk7XG5cbnZhciBfcmVhY3RNYXJrZG93bjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdE1hcmtkb3duKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9Eb2NMaW5rID0gcmVxdWlyZSgnLi9Eb2NMaW5rJyk7XG5cbnZhciBfRG9jTGluazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Eb2NMaW5rKTtcblxudmFyIF9yZXF1aXJlJHJlcXVpcmVMaWIgPSByZXF1aXJlKCdweWRpbycpLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIFVzZXJBdmF0YXIgPSBfcmVxdWlyZSRyZXF1aXJlTGliLlVzZXJBdmF0YXI7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliMiA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgUHlkaW9Db250ZXh0Q29uc3VtZXIgPSBfcmVxdWlyZSRyZXF1aXJlTGliMi5QeWRpb0NvbnRleHRDb25zdW1lcjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gUHlkaW8ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgbW9tZW50ID0gX1B5ZGlvJHJlcXVpcmVMaWIubW9tZW50O1xuXG52YXIgUGFyYWdyYXBoID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFBhcmFncmFwaCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBQYXJhZ3JhcGgoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYXJhZ3JhcGgpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFBhcmFncmFwaC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQYXJhZ3JhcGgsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQYXJhZ3JhcGg7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZnVuY3Rpb24gd29ya3NwYWNlc0xvY2F0aW9ucyhweWRpbywgb2JqZWN0KSB7XG4gICAgdmFyIHdvcmtzcGFjZXMgPSBbXTtcbiAgICBpZiAoIW9iamVjdC5wYXJ0T2YgfHwgIW9iamVjdC5wYXJ0T2YuaXRlbXMgfHwgIW9iamVjdC5wYXJ0T2YuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBcIk5vIHdvcmtzcGFjZSBmb3VuZFwiO1xuICAgIH1cblxuICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHZhciB3cyA9IG9iamVjdC5wYXJ0T2YuaXRlbXNbaV07XG4gICAgICAgIC8vIFJlbW92ZSBzbHVnIHBhcnRcbiAgICAgICAgLy9sZXQgcGF0aHMgPSB3cy5yZWwuc3BsaXQoJy8nKTtcbiAgICAgICAgLy9wYXRocy5zaGlmdCgpO1xuICAgICAgICAvL2xldCByZWxQYXRoID0gcGF0aHMuam9pbignLycpO1xuICAgICAgICB3b3Jrc3BhY2VzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnYScsXG4gICAgICAgICAgICB7IGtleTogd3MuaWQsIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLnRyaWdnZXJSZXBvc2l0b3J5Q2hhbmdlKHdzLmlkKTtcbiAgICAgICAgICAgICAgICB9LCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJyB9IH0sXG4gICAgICAgICAgICB3cy5uYW1lXG4gICAgICAgICkpO1xuICAgICAgICB3b3Jrc3BhY2VzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICB7IGtleTogd3MuaWQgKyAnLXNlcCcgfSxcbiAgICAgICAgICAgICcsICdcbiAgICAgICAgKSk7XG4gICAgfTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqZWN0LnBhcnRPZi5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBfbG9vcChpKTtcbiAgICB9XG4gICAgd29ya3NwYWNlcy5wb3AoKTtcbiAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICdzcGFuJyxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMTYnXSxcbiAgICAgICAgJyAnLFxuICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICB3b3Jrc3BhY2VzXG4gICAgICAgIClcbiAgICApO1xufVxuXG5mdW5jdGlvbiBMaW5rV3JhcHBlcihweWRpbywgYWN0aXZpdHkpIHtcblxuICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgaHJlZiA9IF9wcm9wcy5ocmVmO1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gX3Byb3BzLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICB2YXIgdGl0bGUgPSBcIlwiO1xuICAgICAgICAgICAgdmFyIG9uQ2xpY2sgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGhyZWYuc3RhcnRzV2l0aCgnZG9jOi8vJykpIHtcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZpdHkudHlwZSA9PT0gJ0RlbGV0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB0ZXh0RGVjb3JhdGlvbjogJ2xpbmUtdGhyb3VnaCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfRG9jTGluazJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcHlkaW86IHB5ZGlvLCBhY3Rpdml0eTogYWN0aXZpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChocmVmLnN0YXJ0c1dpdGgoJ3VzZXI6Ly8nKSkge1xuICAgICAgICAgICAgICAgIHZhciB1c2VySWQgPSBocmVmLnJlcGxhY2UoJ3VzZXI6Ly8nLCAnJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJBdmF0YXIsIHsgdXNlcklkOiB1c2VySWQsIGRpc3BsYXlBdmF0YXI6IGZhbHNlLCByaWNoT25DbGljazogdHJ1ZSwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBjb2xvcjogJ3JnYig2NiwgMTQwLCAxNzkpJyB9LCBweWRpbzogcHlkaW8gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgIHsgdGl0bGU6IHRpdGxlLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6ICdyZ2IoNjYsIDE0MCwgMTc5KScgfSwgb25DbGljazogb25DbGljayB9LFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbnZhciBBY3Rpdml0eSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDIpIHtcbiAgICBfaW5oZXJpdHMoQWN0aXZpdHksIF9SZWFjdCRDb21wb25lbnQyKTtcblxuICAgIGZ1bmN0aW9uIEFjdGl2aXR5KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQWN0aXZpdHkpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEFjdGl2aXR5LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEFjdGl2aXR5LCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcbiAgICAgICAgICAgIHZhciBhY3Rpdml0eSA9IF9wcm9wczIuYWN0aXZpdHk7XG4gICAgICAgICAgICB2YXIgbGlzdENvbnRleHQgPSBfcHJvcHMyLmxpc3RDb250ZXh0O1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlDb250ZXh0ID0gX3Byb3BzMi5kaXNwbGF5Q29udGV4dDtcbiAgICAgICAgICAgIHZhciBvbmVMaW5lciA9IF9wcm9wczIub25lTGluZXI7XG5cbiAgICAgICAgICAgIHZhciBzZWNvbmRhcnkgPSBhY3Rpdml0eS50eXBlICsgXCIgLSBcIiArIGFjdGl2aXR5LmFjdG9yLm5hbWU7XG4gICAgICAgICAgICBpZiAoYWN0aXZpdHkuc3VtbWFyeSkge1xuICAgICAgICAgICAgICAgIHNlY29uZGFyeSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9yZWFjdE1hcmtkb3duMlsnZGVmYXVsdCddLCB7IHNvdXJjZTogYWN0aXZpdHkuc3VtbWFyeSwgcmVuZGVyZXJzOiB7ICdwYXJhZ3JhcGgnOiBQYXJhZ3JhcGgsICdsaW5rJzogTGlua1dyYXBwZXIocHlkaW8sIGFjdGl2aXR5KSB9IH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYXZhdGFyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVXNlckF2YXRhciwge1xuICAgICAgICAgICAgICAgIHVzZURlZmF1bHRBdmF0YXI6IHRydWUsXG4gICAgICAgICAgICAgICAgdXNlcklkOiBhY3Rpdml0eS5hY3Rvci5pZCxcbiAgICAgICAgICAgICAgICB1c2VyTGFiZWw6IGFjdGl2aXR5LmFjdG9yLm5hbWUsXG4gICAgICAgICAgICAgICAgZGlzcGxheUxvY2FsTGFiZWw6IHRydWUsXG4gICAgICAgICAgICAgICAgdXNlclR5cGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWF4V2lkdGg6ICc2MCUnIH0sXG4gICAgICAgICAgICAgICAgbGFiZWxTdHlsZTogeyBmb250U2l6ZTogMTQsIHBhZGRpbmdMZWZ0OiAxMCwgb3ZlcmZsb3c6ICdoaWRkZW4nLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsIHdoaXRlU3BhY2U6ICdub3dyYXAnIH0sXG4gICAgICAgICAgICAgICAgYXZhdGFyU3R5bGU6IHsgZmxleFNocmluazogMCB9LFxuICAgICAgICAgICAgICAgIGF2YXRhclNpemU6IDI4LFxuICAgICAgICAgICAgICAgIHJpY2hPbkhvdmVyOiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHN1bW1hcnkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgYWN0aW9uSWNvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBibG9ja1N0eWxlID0ge1xuICAgICAgICAgICAgICAgIG1hcmdpbjogJzBweCAxMHB4IDZweCdcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgc3VtbWFyeVN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc2cHggMjJweCAxMnB4JyxcbiAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6IDYsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAyLFxuICAgICAgICAgICAgICAgIGJvcmRlckxlZnQ6ICcycHggc29saWQgI2UwZTBlMCcsXG4gICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogMTMsXG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsMCwwLDAuMzMpJyxcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA1MDAsXG4gICAgICAgICAgICAgICAgZm9udFN0eWxlOiAnaXRhbGljJyxcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoZGlzcGxheUNvbnRleHQgPT09ICdwb3BvdmVyJykge1xuICAgICAgICAgICAgICAgIHN1bW1hcnlTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMCwwLDAsMC4zMyknLFxuICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA1MDAsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzZweCAwJyxcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogNlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgdGl0bGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGl2aXR5LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ3JlYXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpdml0eS5vYmplY3QudHlwZSA9PT0gJ0RvY3VtZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gXCJmaWxlLXBsdXNcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiZm9sZGVyLXBsdXNcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IFwiQ3JlYXRlZFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRGVsZXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiZGVsZXRlXCI7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gXCJEZWxldGVkXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFZGl0XCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcIlVwZGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBcInBlbmNpbFwiO1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IFwiTW9kaWZpZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlJlYWRcIjpcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gXCJleWVcIjtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBcIkFjY2Vzc2VkXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNb3ZlXCI6XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiZmlsZS1zZW5kXCI7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gXCJNb3ZlZFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0Q29udGV4dCA9PT0gJ05PREUtTEVBRicpIHtcbiAgICAgICAgICAgICAgICBibG9ja1N0eWxlID0geyBtYXJnaW46ICcxNnB4IDEwcHgnIH07XG4gICAgICAgICAgICAgICAgYWN0aW9uSWNvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLVwiICsgY2xhc3NOYW1lLCB0aXRsZTogdGl0bGUsIHN0eWxlOiB7IGZvbnRTaXplOiAxNywgY29sb3I6ICdyZ2JhKDAsMCwwLDAuMTcpJyB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUNvbnRleHQgPT09ICdtYWluTGlzdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkxpc3RJdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0SWNvbjogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiBcIm1kaSBtZGktXCIgKyBjbGFzc05hbWUsIGNvbG9yOiAncmdiYSgwLDAsMCwuMzMpJyB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0OiBzZWNvbmRhcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlUZXh0OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwuMzMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlc0xvY2F0aW9ucyhweWRpbywgYWN0aXZpdHkub2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlzcGxheUNvbnRleHQgPT09ICdwb3BvdmVyJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGVmdEljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1cIiArIGNsYXNzTmFtZSwgdGl0bGU6IHRpdGxlLCBzdHlsZTogeyBwYWRkaW5nOiAnMCA4cHgnLCBmb250U2l6ZTogMjAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjE3KScgfSB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdEljb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgc3VtbWFyeVN0eWxlLCB7IGZsZXg6IDEgfSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN1bW1hcnlTdHlsZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogYmxvY2tTdHlsZSB9LFxuICAgICAgICAgICAgICAgICFvbmVMaW5lciAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhcixcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGZsZXg6IDEsIGhlaWdodDogMTgsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjIzKScsIGZvbnRXZWlnaHQ6IDUwMCwgcGFkZGluZ0xlZnQ6IDgsIHdoaXRlU3BhY2U6ICdub3dyYXAnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbWVudChhY3Rpdml0eS51cGRhdGVkKS5mcm9tTm93KClcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uSWNvblxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgc3VtbWFyeVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBBY3Rpdml0eTtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5BY3Rpdml0eS5Qcm9wVHlwZXMgPSB7XG4gICAgYWN0aXZpdHk6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIGxpc3RDb250ZXh0OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICBkaXNwbGF5Q29udGV4dDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vbmVPZihbJ21haW5MaXN0JywgJ2luZm9QYW5lbCcsICdwb3BvdmVyJ10pXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBBY3Rpdml0eSA9IFB5ZGlvQ29udGV4dENvbnN1bWVyKEFjdGl2aXR5KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEFjdGl2aXR5O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfQ2xpZW50ID0gcmVxdWlyZSgnLi9DbGllbnQnKTtcblxudmFyIF9DbGllbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ2xpZW50KTtcblxudmFyIF9BY3Rpdml0eSA9IHJlcXVpcmUoJy4vQWN0aXZpdHknKTtcblxudmFyIF9BY3Rpdml0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9BY3Rpdml0eSk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBQeWRpb0NvbnRleHRDb25zdW1lciA9IF9QeWRpbyRyZXF1aXJlTGliLlB5ZGlvQ29udGV4dENvbnN1bWVyO1xudmFyIG1vbWVudCA9IF9QeWRpbyRyZXF1aXJlTGliLm1vbWVudDtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBFbXB0eVN0YXRlVmlldyA9IF9QeWRpbyRyZXF1aXJlTGliMi5FbXB0eVN0YXRlVmlldztcblxudmFyIEFjdGl2aXR5TGlzdCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhBY3Rpdml0eUxpc3QsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQWN0aXZpdHlMaXN0KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBY3Rpdml0eUxpc3QpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEFjdGl2aXR5TGlzdC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgaWYgKHByb3BzLml0ZW1zKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0geyBkYXRhOiB7IGl0ZW1zOiBwcm9wcy5pdGVtcyB9LCBvZmZzZXQ6IDAsIGxvYWRNb3JlOiBmYWxzZSwgbG9hZGluZzogZmFsc2UgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB7IGRhdGE6IFtdLCBvZmZzZXQ6IDAsIGxvYWRNb3JlOiB0cnVlLCBsb2FkaW5nOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEFjdGl2aXR5TGlzdCwgW3tcbiAgICAgICAga2V5OiAnbWVyZ2VNb3JlRmVlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBtZXJnZU1vcmVGZWVkKGN1cnJlbnRGZWVkLCBuZXdGZWVkKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudElkcyA9IGN1cnJlbnRGZWVkLml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmlkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBuZXdGZWVkLml0ZW1zLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50SWRzLmluZGV4T2YoaXRlbS5pZCkgPT09IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIWZpbHRlcmVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkTW9yZTogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRGZWVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1lcmdlZCA9IGN1cnJlbnRGZWVkO1xuICAgICAgICAgICAgbWVyZ2VkLml0ZW1zID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShjdXJyZW50RmVlZC5pdGVtcyksIF90b0NvbnN1bWFibGVBcnJheShmaWx0ZXJlZCkpO1xuICAgICAgICAgICAgbWVyZ2VkLnRvdGFsSXRlbXMgPSBtZXJnZWQuaXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZEZvclByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWRGb3JQcm9wcyhwcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBwcm9wcy5jb250ZXh0O1xuICAgICAgICAgICAgdmFyIHBvaW50T2ZWaWV3ID0gcHJvcHMucG9pbnRPZlZpZXc7XG4gICAgICAgICAgICB2YXIgY29udGV4dERhdGEgPSBwcm9wcy5jb250ZXh0RGF0YTtcbiAgICAgICAgICAgIHZhciBsaW1pdCA9IHByb3BzLmxpbWl0O1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gX3N0YXRlLm9mZnNldDtcbiAgICAgICAgICAgIHZhciBkYXRhID0gX3N0YXRlLmRhdGE7XG5cbiAgICAgICAgICAgIGlmIChsaW1pdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGltaXQgPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiAwKSB7XG4gICAgICAgICAgICAgICAgbGltaXQgPSAxMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgIF9DbGllbnQyWydkZWZhdWx0J10ubG9hZEFjdGl2aXR5U3RyZWFtcyhmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXQgPiAwICYmIGRhdGEgJiYgZGF0YS5pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbiAmJiBqc29uLml0ZW1zKSBfdGhpcy5zZXRTdGF0ZSh7IGRhdGE6IF90aGlzLm1lcmdlTW9yZUZlZWQoZGF0YSwganNvbikgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBkYXRhOiBqc29uIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWpzb24gfHwgIWpzb24uaXRlbXMgfHwgIWpzb24uaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgbG9hZE1vcmU6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSwgY29udGV4dCwgY29udGV4dERhdGEsICdvdXRib3gnLCBwb2ludE9mVmlldywgb2Zmc2V0LCBsaW1pdCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IF9wcm9wcy5pdGVtcztcbiAgICAgICAgICAgIHZhciBjb250ZXh0RGF0YSA9IF9wcm9wcy5jb250ZXh0RGF0YTtcblxuICAgICAgICAgICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbnRleHREYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkRm9yUHJvcHModGhpcy5wcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRhdGE6IHsgaXRlbXM6IG5leHRQcm9wcy5pdGVtcyB9LCBvZmZzZXQ6IDAsIGxvYWRNb3JlOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLmNvbnRleHREYXRhICE9PSB0aGlzLnByb3BzLmNvbnRleHREYXRhIHx8IG5leHRQcm9wcy5jb250ZXh0ICE9PSB0aGlzLnByb3BzLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgb2Zmc2V0OiAwLCBsb2FkTW9yZTogdHJ1ZSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5sb2FkRm9yUHJvcHMobmV4dFByb3BzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IFtdO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBfc3RhdGUyLmRhdGE7XG4gICAgICAgICAgICB2YXIgbG9hZE1vcmUgPSBfc3RhdGUyLmxvYWRNb3JlO1xuICAgICAgICAgICAgdmFyIGxvYWRpbmcgPSBfc3RhdGUyLmxvYWRpbmc7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbGlzdENvbnRleHQgPSBfcHJvcHMyLmxpc3RDb250ZXh0O1xuICAgICAgICAgICAgdmFyIGdyb3VwQnlEYXRlID0gX3Byb3BzMi5ncm91cEJ5RGF0ZTtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5Q29udGV4dCA9IF9wcm9wczIuZGlzcGxheUNvbnRleHQ7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNGcm9tID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGRhdGEgIT09IG51bGwgJiYgZGF0YS5pdGVtcykge1xuICAgICAgICAgICAgICAgIGRhdGEuaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoYWMpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgZnJvbU5vdyA9IG1vbWVudChhYy51cGRhdGVkKS5mcm9tTm93KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChncm91cEJ5RGF0ZSAmJiBmcm9tTm93ICE9PSBwcmV2aW91c0Zyb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcwIDE2cHgnLCBmb250U2l6ZTogMTMsIGNvbG9yOiAncmdiYSgxNDcsIDE2OCwgMTc4LCAwLjY3KScsIGZvbnRXZWlnaHQ6IDUwMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbU5vd1xuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9BY3Rpdml0eTJbJ2RlZmF1bHQnXSwgeyBrZXk6IGFjLmlkLCBhY3Rpdml0eTogYWMsIGxpc3RDb250ZXh0OiBsaXN0Q29udGV4dCwgb25lTGluZXI6IGdyb3VwQnlEYXRlLCBkaXNwbGF5Q29udGV4dDogZGlzcGxheUNvbnRleHQgfSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeURhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzRnJvbSA9IGZyb21Ob3c7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCAmJiBsb2FkTW9yZSkge1xuICAgICAgICAgICAgICAgIHZhciBsb2FkQWN0aW9uID0gZnVuY3Rpb24gbG9hZEFjdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgb2Zmc2V0OiBkYXRhLml0ZW1zLmxlbmd0aCArIDEgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLmxvYWRGb3JQcm9wcyhfdGhpczMucHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnRlbnQucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ0xlZnQ6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBwcmltYXJ5OiB0cnVlLCBsYWJlbDogbG9hZGluZyA/IHB5ZGlvLk1lc3NhZ2VIYXNoWydub3RpZmljYXRpb25fY2VudGVyLjIwJ10gOiBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci4xOSddLCBkaXNhYmxlZDogbG9hZGluZywgb25Ub3VjaFRhcDogbG9hZEFjdGlvbiB9KVxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5MaXN0LFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSB7IGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyB9O1xuICAgICAgICAgICAgICAgIHZhciBpY29uU3R5bGUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZFN0eWxlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5Q29udGV4dCA9PT0gJ3BvcG92ZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlID0geyBtaW5IZWlnaHQ6IDI1MCB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlzcGxheUNvbnRleHQgPT09ICdpbmZvUGFuZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlID0geyBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsIHBhZGRpbmdCb3R0b206IDIwIH07XG4gICAgICAgICAgICAgICAgICAgIGljb25TdHlsZSA9IHsgZm9udFNpemU6IDQwIH07XG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZFN0eWxlID0geyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDQwMCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRW1wdHlTdGF0ZVZpZXcsIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLXB1bHNlJyxcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHRJZDogbG9hZGluZyA/IHB5ZGlvLk1lc3NhZ2VIYXNoWydub3RpZmljYXRpb25fY2VudGVyLjE3J10gOiBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci4xOCddLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogc3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIGljb25TdHlsZTogaWNvblN0eWxlLFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRTdHlsZTogbGVnZW5kU3R5bGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBBY3Rpdml0eUxpc3Q7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuQWN0aXZpdHlMaXN0LlByb3BUeXBlcyA9IHtcbiAgICBjb250ZXh0OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjb250ZXh0RGF0YTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgYm94TmFtZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgcG9pbnRPZlZpZXc6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub25lT2YoWydHRU5FUklDJywgJ0FDVE9SJywgJ1NVQkpFQ1QnXSksXG4gICAgZGlzcGxheUNvbnRleHQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub25lT2YoWydtYWluTGlzdCcsICdpbmZvUGFuZWwnLCAncG9wb3ZlciddKVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQWN0aXZpdHlMaXN0ID0gUHlkaW9Db250ZXh0Q29uc3VtZXIoQWN0aXZpdHlMaXN0KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEFjdGl2aXR5TGlzdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTggQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxudmFyIENhbGxiYWNrcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FsbGJhY2tzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2FsbGJhY2tzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ2FsbGJhY2tzLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICd0b2dnbGVXYXRjaCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB0b2dnbGVXYXRjaChtYW5hZ2VyLCBhcmdzKSB7XG5cbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHB5ZGlvLmdldFVzZXJTZWxlY3Rpb24oKS5nZXRVbmlxdWVOb2RlKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlVXVpZCA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVzZXJJZCA9IHB5ZGlvLnVzZXIuaWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb24gPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuQWN0aXZpdHlTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuQWN0aXZpdHlPd25lclR5cGUoKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLlVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLk9iamVjdElkID0gbm9kZVV1aWQ7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5PYmplY3RUeXBlID0gdHlwZS5OT0RFO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdzID09PSAnd2F0Y2hfY2hhbmdlJyB8fCBhcmdzID09PSAnd2F0Y2hfYm90aCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5wdXNoKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncyA9PT0gJ3dhdGNoX3JlYWQnIHx8IGFyZ3MgPT09ICd3YXRjaF9ib3RoJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnB1c2goJ3JlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uRXZlbnRzID0gZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLkFjdGl2aXR5U2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGFwaS5zdWJzY3JpYmUoc3Vic2NyaXB0aW9uKS50aGVuKGZ1bmN0aW9uIChvdXRTdWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvdmVybGF5ID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgnb3ZlcmxheV9jbGFzcycpIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MgPT09ICd3YXRjaF9zdG9wJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKVsnZGVsZXRlJ10oJ21ldGFfd2F0Y2hlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoJ292ZXJsYXlfY2xhc3MnLCBvdmVybGF5LnJlcGxhY2UoJ21kaSBtZGktcnNzJywgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgnbWV0YV93YXRjaGVkJywgJ01FVEFfJyArIGFyZ3MudG9VcHBlckNhc2UoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG92ZXJsYXlzID0gb3ZlcmxheS5yZXBsYWNlKCdtZGkgbWRpLXJzcycsICcnKS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJsYXlzLnB1c2goJ21kaSBtZGktcnNzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgnb3ZlcmxheV9jbGFzcycsIG92ZXJsYXlzLmpvaW4oJywnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLm5vdGlmeSgnbm9kZV9yZXBsYWNlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENhbGxiYWNrcztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgQVMyQ2xpZW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBUzJDbGllbnQoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBUzJDbGllbnQpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhBUzJDbGllbnQsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2xvYWRBY3Rpdml0eVN0cmVhbXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZEFjdGl2aXR5U3RyZWFtcygpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uIChqc29uKSB7fSA6IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ1VTRVJfSUQnIDogYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgdmFyIGNvbnRleHREYXRhID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gJycgOiBhcmd1bWVudHNbMl07XG4gICAgICAgICAgICB2YXIgYm94TmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/ICdvdXRib3gnIDogYXJndW1lbnRzWzNdO1xuICAgICAgICAgICAgdmFyIHBvaW50T2ZWaWV3ID0gYXJndW1lbnRzLmxlbmd0aCA8PSA0IHx8IGFyZ3VtZW50c1s0XSA9PT0gdW5kZWZpbmVkID8gJycgOiBhcmd1bWVudHNbNF07XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSA1IHx8IGFyZ3VtZW50c1s1XSA9PT0gdW5kZWZpbmVkID8gLTEgOiBhcmd1bWVudHNbNV07XG4gICAgICAgICAgICB2YXIgbGltaXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDYgfHwgYXJndW1lbnRzWzZdID09PSB1bmRlZmluZWQgPyAtMSA6IGFyZ3VtZW50c1s2XTtcblxuICAgICAgICAgICAgaWYgKCFjb250ZXh0RGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuQWN0aXZpdHlTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHZhciByZXEgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuQWN0aXZpdHlTdHJlYW1BY3Rpdml0aWVzUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxLkNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgcmVxLkNvbnRleHREYXRhID0gY29udGV4dERhdGE7XG4gICAgICAgICAgICByZXEuQm94TmFtZSA9IGJveE5hbWU7XG4gICAgICAgICAgICBpZiAob2Zmc2V0ID4gLTEpIHtcbiAgICAgICAgICAgICAgICByZXEuT2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbWl0ID4gLTEpIHtcbiAgICAgICAgICAgICAgICByZXEuTGltaXQgPSBsaW1pdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcS5MYW5ndWFnZSA9IHB5ZGlvLnVzZXIuZ2V0UHJlZmVyZW5jZShcImxhbmdcIikgfHwgJyc7XG4gICAgICAgICAgICBpZiAocG9pbnRPZlZpZXcpIHtcbiAgICAgICAgICAgICAgICByZXEuUG9pbnRPZlZpZXcgPSBwb2ludE9mVmlldztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFwaS5zdHJlYW0ocmVxKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnVW5yZWFkSW5ib3gnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gVW5yZWFkSW5ib3godXNlcklkKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoY291bnQpIHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLkFjdGl2aXR5U2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICB2YXIgcmVxID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLkFjdGl2aXR5U3RyZWFtQWN0aXZpdGllc1JlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcS5Db250ZXh0ID0gJ1VTRVJfSUQnO1xuICAgICAgICAgICAgcmVxLkNvbnRleHREYXRhID0gdXNlcklkO1xuICAgICAgICAgICAgcmVxLkJveE5hbWUgPSAnaW5ib3gnO1xuICAgICAgICAgICAgcmVxLlVucmVhZENvdW50T25seSA9IHRydWU7XG4gICAgICAgICAgICBhcGkuc3RyZWFtKHJlcSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IGRhdGEudG90YWxJdGVtcyB8fCAwO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNvdW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEFTMkNsaWVudDtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEFTMkNsaWVudDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgUG9wb3ZlciA9IF9yZXF1aXJlLlBvcG92ZXI7XG52YXIgUGFwZXIgPSBfcmVxdWlyZS5QYXBlcjtcbnZhciBJY29uQnV0dG9uID0gX3JlcXVpcmUuSWNvbkJ1dHRvbjtcbnZhciBGbGF0QnV0dG9uID0gX3JlcXVpcmUuRmxhdEJ1dHRvbjtcbnZhciBEaXZpZGVyID0gX3JlcXVpcmUuRGl2aWRlcjtcblxudmFyIFB5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC5kZWJvdW5jZScpO1xudmFyIE1ldGFOb2RlUHJvdmlkZXIgPSByZXF1aXJlKCdweWRpby9tb2RlbC9tZXRhLW5vZGUtcHJvdmlkZXInKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gUHlkaW8ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgUHlkaW9Db250ZXh0Q29uc3VtZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5QeWRpb0NvbnRleHRDb25zdW1lcjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ3dvcmtzcGFjZXMnKTtcblxudmFyIEZpbGVQcmV2aWV3ID0gX1B5ZGlvJHJlcXVpcmVMaWIyLkZpbGVQcmV2aWV3O1xuXG5mdW5jdGlvbiBub2Rlc0Zyb21PYmplY3Qob2JqZWN0LCBweWRpbykge1xuICAgIHZhciBub2RlcyA9IFtdO1xuICAgIHZhciBjdXJyZW50UmVwb3NpdG9yeSA9IHB5ZGlvLnVzZXIuZ2V0QWN0aXZlUmVwb3NpdG9yeSgpO1xuICAgIGlmICghb2JqZWN0LnBhcnRPZiB8fCAhb2JqZWN0LnBhcnRPZi5pdGVtcyB8fCAhb2JqZWN0LnBhcnRPZi5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iamVjdC5wYXJ0T2YuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHdzID0gb2JqZWN0LnBhcnRPZi5pdGVtc1tpXTtcbiAgICAgICAgLy8gUmVtb3ZlIHNsdWcgcGFydFxuICAgICAgICB2YXIgcGF0aHMgPSB3cy5yZWwuc3BsaXQoJy8nKTtcbiAgICAgICAgcGF0aHMuc2hpZnQoKTtcbiAgICAgICAgdmFyIHJlbFBhdGggPSBwYXRocy5qb2luKCcvJyk7XG4gICAgICAgIHZhciBub2RlID0gbmV3IEFqeHBOb2RlKHJlbFBhdGgsIG9iamVjdC50eXBlID09PSAnRG9jdW1lbnQnKTtcbiAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9pZCcsIHdzLmlkKTtcbiAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9sYWJlbCcsIHdzLm5hbWUpO1xuICAgICAgICBpZiAod3MuaWQgPT09IGN1cnJlbnRSZXBvc2l0b3J5KSB7XG4gICAgICAgICAgICByZXR1cm4gW25vZGVdO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICAgIHJldHVybiBub2Rlcztcbn1cblxudmFyIERvY1ByZXZpZXcgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRG9jUHJldmlldywgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBEb2NQcmV2aWV3KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEb2NQcmV2aWV3KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihEb2NQcmV2aWV3LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB2YXIgbm9kZXMgPSBub2Rlc0Zyb21PYmplY3QocHJvcHMuYWN0aXZpdHkub2JqZWN0LCBwcm9wcy5weWRpbyk7XG4gICAgICAgIGlmIChub2Rlcy5sZW5ndGggJiYgIW5vZGVzWzBdLmlzTGVhZigpKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgICAgIHByZXZpZXdMb2FkZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJldmlld0ZhaWxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbm9kZXM6IG5vZGVzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgICAgICBwcmV2aWV3TG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcmV2aWV3RmFpbGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub2Rlczogbm9kZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRG9jUHJldmlldywgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBwcmV2aWV3TG9hZGVkID0gX3N0YXRlLnByZXZpZXdMb2FkZWQ7XG4gICAgICAgICAgICB2YXIgbm9kZXMgPSBfc3RhdGUubm9kZXM7XG4gICAgICAgICAgICB2YXIgcHJldmlld0ZhaWxlZCA9IF9zdGF0ZS5wcmV2aWV3RmFpbGVkO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlld05vZGUgPSBub2Rlcy5sZW5ndGggPyBub2Rlc1swXSA6IG51bGw7XG4gICAgICAgICAgICB2YXIgZlByZXZpZXcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgZlByZXZpZXdMb2FkaW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGZQcmV2aWV3U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAyMDAsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgZm9udFNpemU6IDcwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHByZXZpZXdOb2RlICYmIHByZXZpZXdOb2RlLmlzTGVhZigpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZpZXdMb2FkZWQgJiYgIXByZXZpZXdGYWlsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZlByZXZpZXcgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChGaWxlUHJldmlldywgeyBzdHlsZTogZlByZXZpZXdTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IHByZXZpZXdOb2RlLCBweWRpbzogcHlkaW8sIGxvYWRUaHVtYm5haWw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByaWNoUHJldmlldzogdHJ1ZSwgcHJvY2Vzc2luZzogIXByZXZpZXdMb2FkZWQgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcmV2aWV3TG9hZGVkICYmIHByZXZpZXdGYWlsZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICBmUHJldmlldyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgZlByZXZpZXdTdHlsZSwgeyBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9KSwgY2xhc3NOYW1lOiAnbWltZWZvbnQtY29udGFpbmVyJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAnbWltZWZvbnQgbWRpIG1kaS1kZWxldGUnIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRmlsZSBkZWxldGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZVJlcG9JZCA9IHByZXZpZXdOb2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdyZXBvc2l0b3J5X2lkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZVJlcG9MYWJlbCA9IHByZXZpZXdOb2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdyZXBvc2l0b3J5X2xhYmVsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBuZXcgTWV0YU5vZGVQcm92aWRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlld05vZGUub2JzZXJ2ZU9uY2UoJ2Vycm9yJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgcHJldmlld0xvYWRlZDogdHJ1ZSwgcHJldmlld0ZhaWxlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXIubG9hZExlYWZOb2RlU3luYyhwcmV2aWV3Tm9kZSwgZnVuY3Rpb24gKGxvYWRlZE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZWROb2RlLmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2lkJywgbm9kZVJlcG9JZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVkTm9kZS5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9sYWJlbCcsIG5vZGVSZXBvTGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzWzBdID0gbG9hZGVkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHByZXZpZXdMb2FkZWQ6IHRydWUsIG5vZGVzOiBub2RlcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRydWUsIHsgdG1wX3JlcG9zaXRvcnlfaWQ6IG5vZGVSZXBvSWQgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZQcmV2aWV3TG9hZGluZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEZpbGVQcmV2aWV3LCB7IHN0eWxlOiBmUHJldmlld1N0eWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IHByZXZpZXdOb2RlLCBweWRpbzogcHlkaW8sIGxvYWRUaHVtYm5haWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpY2hQcmV2aWV3OiBmYWxzZSwgcHJvY2Vzc2luZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBidXR0b25zID0gW107XG4gICAgICAgICAgICB2YXIgY3VycmVudFJlcG9CdXR0b24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgY3VycmVudFJlcG9zaXRvcnkgPSBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnkoKTtcblxuICAgICAgICAgICAgdmFyIF9sb29wID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBidXR0b24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgcGFkZGluZ0xlZnQ6IDEwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA1MDAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjMzKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMTYnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3JlcG9zaXRvcnlfbGFiZWwnKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1vcGVuLWluLW5ld1wiLCB0b29sdGlwOiBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci42J10sIHRvb2x0aXBQb3NpdGlvbjogXCJ0b3AtY2VudGVyXCIsIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpby5nb1RvKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3JlcG9zaXRvcnlfaWQnKSA9PT0gY3VycmVudFJlcG9zaXRvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFJlcG9CdXR0b24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChGbGF0QnV0dG9uLCB7IGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci42J10sIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1vcGVuLWluLW5ld1wiLCB0b29sdGlwOiAnT3BlbicsIHRvb2x0aXBQb3NpdGlvbjogXCJ0b3AtcmlnaHRcIiwgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpby5nb1RvKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdicmVhayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJ1dHRvbnMucHVzaChidXR0b24pO1xuICAgICAgICAgICAgICAgIGlmIChpIDwgbm9kZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBidXR0b25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRGl2aWRlciwgbnVsbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgX3JldDIgPSBfbG9vcChpKTtcblxuICAgICAgICAgICAgICAgIGlmIChfcmV0MiA9PT0gJ2JyZWFrJykgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3VycmVudFJlcG9CdXR0b24pIHtcbiAgICAgICAgICAgICAgICBidXR0b25zID0gW2N1cnJlbnRSZXBvQnV0dG9uXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgIXByZXZpZXdGYWlsZWQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDYgfSB9LFxuICAgICAgICAgICAgICAgICAgICBidXR0b25zXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEb2NQcmV2aWV3O1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbnZhciBEb2NMaW5rID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mikge1xuICAgIF9pbmhlcml0cyhEb2NMaW5rLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBEb2NMaW5rKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEb2NMaW5rKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihEb2NMaW5rLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2hvd1BvcG92ZXI6IGZhbHNlLFxuICAgICAgICAgICAgcG9wb3ZlckFuY2hvcjogbnVsbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhEb2NMaW5rLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGFjdGl2aXR5ID0gX3Byb3BzLmFjdGl2aXR5O1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gX3Byb3BzLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICB2YXIgbm9kZXMgPSBub2Rlc0Zyb21PYmplY3QoYWN0aXZpdHkub2JqZWN0LCBweWRpbyk7XG5cbiAgICAgICAgICAgIHZhciBvbkNsaWNrID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG9uTW91c2VPdXQgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgcG9wb3ZlciA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgdmFyIHBhdGhQYXJ0cyA9IGFjdGl2aXR5Lm9iamVjdC5uYW1lLnJlcGxhY2UoJ2RvYzovLycsICcnKS5zcGxpdCgnLycpO1xuICAgICAgICAgICAgcGF0aFBhcnRzLnNoaWZ0KCk7XG4gICAgICAgICAgICB2YXIgdGl0bGUgPSAnLycgKyBwYXRoUGFydHMuam9pbignLycpO1xuXG4gICAgICAgICAgICBpZiAobm9kZXMubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICAgICAgb25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ29Ubyhub2Rlc1swXSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBvbk1vdXNlT3V0ID0gZGVib3VuY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBzaG93UG9wb3ZlcjogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgfSwgMzUwKTtcbiAgICAgICAgICAgICAgICBvbk1vdXNlT3ZlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHNob3dQb3BvdmVyOiB0cnVlLCBwb3BvdmVyQW5jaG9yOiBlLmN1cnJlbnRUYXJnZXQgfSk7XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdXQuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgb25Nb3VzZU92ZXJJbm5lciA9IGZ1bmN0aW9uIG9uTW91c2VPdmVySW5uZXIoZSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBzaG93UG9wb3ZlcjogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU91dC5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcG9wb3ZlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBQb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiB0aGlzLnN0YXRlLnNob3dQb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IHRoaXMuc3RhdGUucG9wb3ZlckFuY2hvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVxdWVzdENsb3NlOiBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlYXNvbiAhPT0gJ2NsaWNrQXdheScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgc2hvd1BvcG92ZXI6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogXCJsZWZ0XCIsIHZlcnRpY2FsOiBcImJvdHRvbVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogXCJsZWZ0XCIsIHZlcnRpY2FsOiBcInRvcFwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VMYXllckZvckNsaWNrQXdheTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBQYXBlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgekRlcHRoOiAyLCBzdHlsZTogeyB3aWR0aDogMjAwLCBoZWlnaHQ6ICdhdXRvJywgb3ZlcmZsb3dZOiAnYXV0bycgfSwgb25Nb3VzZU92ZXI6IG9uTW91c2VPdmVySW5uZXIsIG9uTW91c2VPdXQ6IG9uTW91c2VPdXQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KERvY1ByZXZpZXcsIHsgcHlkaW86IHB5ZGlvLCBhY3Rpdml0eTogYWN0aXZpdHkgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdvVG8obm9kZXNbMF0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICB7IHRpdGxlOiB0aXRsZSwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIGNvbG9yOiAncmdiKDY2LCAxNDAsIDE3OSknIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3Zlcjogb25Nb3VzZU92ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3V0OiBvbk1vdXNlT3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogb25DbGljayB9LFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgcG9wb3ZlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEb2NMaW5rO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbkRvY0xpbmsuUHJvcFR5cGVzID0ge1xuICAgIGFjdGl2aXR5OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICBweWRpbzogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKFB5ZGlvKVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRG9jTGluayA9IFB5ZGlvQ29udGV4dENvbnN1bWVyKERvY0xpbmspO1xuZXhwb3J0c1snZGVmYXVsdCddID0gRG9jTGluaztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9BY3Rpdml0eUxpc3QgPSByZXF1aXJlKCcuL0FjdGl2aXR5TGlzdCcpO1xuXG52YXIgX0FjdGl2aXR5TGlzdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9BY3Rpdml0eUxpc3QpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBQeWRpby5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBQeWRpb0NvbnRleHRDb25zdW1lciA9IF9QeWRpbyRyZXF1aXJlTGliLlB5ZGlvQ29udGV4dENvbnN1bWVyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIyID0gUHlkaW8ucmVxdWlyZUxpYignd29ya3NwYWNlcycpO1xuXG52YXIgSW5mb1BhbmVsQ2FyZCA9IF9QeWRpbyRyZXF1aXJlTGliMi5JbmZvUGFuZWxDYXJkO1xuXG52YXIgSW5mb1BhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEluZm9QYW5lbCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBJbmZvUGFuZWwoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBJbmZvUGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEluZm9QYW5lbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhJbmZvUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzLm5vZGU7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBJbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgIHsgaWRlbnRpZmllcjogXCJhY3Rpdml0eVwiLCB0aXRsZTogbm9kZS5pc0xlYWYoKSA/IHB5ZGlvLk1lc3NhZ2VIYXNoWydub3RpZmljYXRpb25fY2VudGVyLjExJ10gOiBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci4xMCddIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX0FjdGl2aXR5TGlzdDJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnTk9ERV9JRCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHREYXRhOiBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd1dWlkJyksXG4gICAgICAgICAgICAgICAgICAgIGJveE5hbWU6ICdvdXRib3gnLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBvdmVyZmxvd1k6ICdzY3JvbGwnLCBtYXhIZWlnaHQ6IDM4MCB9LFxuICAgICAgICAgICAgICAgICAgICBsaXN0Q29udGV4dDogXCJOT0RFLVwiICsgKG5vZGUuaXNMZWFmKCkgPyBcIkxFQUZcIiA6IFwiQ09MTEVDVElPTlwiKSxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRPZlZpZXc6IFwiQUNUT1JcIixcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheUNvbnRleHQ6ICdpbmZvUGFuZWwnXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW5mb1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEluZm9QYW5lbCA9IFB5ZGlvQ29udGV4dENvbnN1bWVyKEluZm9QYW5lbCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBJbmZvUGFuZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE4IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIExpc3RlbmVycyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTGlzdGVuZXJzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTGlzdGVuZXJzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTGlzdGVuZXJzLCBudWxsLCBbe1xuICAgICAgICBrZXk6IFwiZHluYW1pY0J1aWxkZXJcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGR5bmFtaWNCdWlsZGVyKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IGdsb2JhbC5weWRpbztcbiAgICAgICAgICAgIHZhciBNZXNzYWdlSGFzaCA9IHB5ZGlvLk1lc3NhZ2VIYXNoO1xuXG4gICAgICAgICAgICB2YXIgbiA9IHB5ZGlvLmdldFVzZXJTZWxlY3Rpb24oKS5nZXRVbmlxdWVOb2RlKCk7XG4gICAgICAgICAgICBpZiAoIW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBidWlsZGVyTWVudUl0ZW1zID0gW107XG4gICAgICAgICAgICB2YXIgbWV0YVZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG4uZ2V0TWV0YWRhdGEoKS5nZXQoXCJtZXRhX3dhdGNoZWRcIikpIHtcbiAgICAgICAgICAgICAgICBtZXRhVmFsdWUgPSBuLmdldE1ldGFkYXRhKCkuZ2V0KFwibWV0YV93YXRjaGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnVpbGRlck1lbnVJdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBNZXNzYWdlSGFzaFtcIm1ldGEud2F0Y2guMTFcIl0sXG4gICAgICAgICAgICAgICAgYWx0OiBNZXNzYWdlSGFzaFtcIm1ldGEud2F0Y2guXCIgKyAobi5pc0xlYWYoKSA/IFwiMTJcIiA6IFwiMTJiXCIpXSxcbiAgICAgICAgICAgICAgICBpc0RlZmF1bHQ6IG1ldGFWYWx1ZSAmJiBtZXRhVmFsdWUgPT0gXCJNRVRBX1dBVENIX0NIQU5HRVwiLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseSgnd2F0Y2hfY2hhbmdlJyk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBidWlsZGVyTWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IE1lc3NhZ2VIYXNoW1wibWV0YS53YXRjaC45XCJdLFxuICAgICAgICAgICAgICAgIGFsdDogTWVzc2FnZUhhc2hbXCJtZXRhLndhdGNoLlwiICsgKG4uaXNMZWFmKCkgPyBcIjEwXCIgOiBcIjEwYlwiKV0sXG4gICAgICAgICAgICAgICAgaXNEZWZhdWx0OiBtZXRhVmFsdWUgJiYgbWV0YVZhbHVlID09IFwiTUVUQV9XQVRDSF9SRUFEXCIsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5KCd3YXRjaF9yZWFkJyk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBidWlsZGVyTWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IE1lc3NhZ2VIYXNoW1wibWV0YS53YXRjaC4xM1wiXSxcbiAgICAgICAgICAgICAgICBhbHQ6IE1lc3NhZ2VIYXNoW1wibWV0YS53YXRjaC5cIiArIChuLmlzTGVhZigpID8gXCIxNFwiIDogXCIxNGJcIildLFxuICAgICAgICAgICAgICAgIGlzRGVmYXVsdDogbWV0YVZhbHVlICYmIG1ldGFWYWx1ZSA9PSBcIk1FVEFfV0FUQ0hfQk9USFwiLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseSgnd2F0Y2hfYm90aCcpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG1ldGFWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGJ1aWxkZXJNZW51SXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHNlcGFyYXRvcjogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJ1aWxkZXJNZW51SXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IE1lc3NhZ2VIYXNoWydtZXRhLndhdGNoLjMnXSxcbiAgICAgICAgICAgICAgICAgICAgYWx0OiBNZXNzYWdlSGFzaFtcIm1ldGEud2F0Y2guXCIgKyAobi5pc0xlYWYoKSA/IFwiOFwiIDogXCI0XCIpXSxcbiAgICAgICAgICAgICAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseSgnd2F0Y2hfc3RvcCcpO1xuICAgICAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBidWlsZGVyTWVudUl0ZW1zO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIExpc3RlbmVycztcbn0pKCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gTGlzdGVuZXJzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfQ2xpZW50ID0gcmVxdWlyZSgnLi9DbGllbnQnKTtcblxudmFyIF9DbGllbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ2xpZW50KTtcblxudmFyIF9BY3Rpdml0eUxpc3QgPSByZXF1aXJlKCcuL0FjdGl2aXR5TGlzdCcpO1xuXG52YXIgX0FjdGl2aXR5TGlzdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9BY3Rpdml0eUxpc3QpO1xuXG52YXIgX2xvZGFzaERlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoLmRlYm91bmNlJyk7XG5cbnZhciBfbG9kYXNoRGVib3VuY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9kYXNoRGVib3VuY2UpO1xuXG52YXIgVXNlclBhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFVzZXJQYW5lbCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBVc2VyUGFuZWwocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFVzZXJQYW5lbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoVXNlclBhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdW5yZWFkU3RhdHVzOiAwLFxuICAgICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgICBkYXRhOiBbXVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJlbG9hZERhdGEgPSAoMCwgX2xvZGFzaERlYm91bmNlMlsnZGVmYXVsdCddKSh0aGlzLnJlbG9hZERhdGEuYmluZCh0aGlzKSwgNTAwKTtcbiAgICAgICAgdGhpcy5yZWxvYWRVbnJlYWQgPSAoMCwgX2xvZGFzaERlYm91bmNlMlsnZGVmYXVsdCddKSh0aGlzLnJlbG9hZFVucmVhZC5iaW5kKHRoaXMpLCA1MDApO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVc2VyUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ3JlbG9hZERhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVsb2FkRGF0YSgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIF9DbGllbnQyWydkZWZhdWx0J10ubG9hZEFjdGl2aXR5U3RyZWFtcyhmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgZGF0YToganNvbiB9KTtcbiAgICAgICAgICAgIH0sICdVU0VSX0lEJywgdGhpcy5wcm9wcy5weWRpby51c2VyLmlkLCAnaW5ib3gnKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVsb2FkVW5yZWFkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbG9hZFVucmVhZCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBfQ2xpZW50MlsnZGVmYXVsdCddLlVucmVhZEluYm94KHRoaXMucHJvcHMucHlkaW8udXNlci5pZCwgZnVuY3Rpb24gKGNvdW50KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgdW5yZWFkU3RhdHVzOiBjb3VudCB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvblN0YXR1c0NoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvblN0YXR1c0NoYW5nZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uVW5yZWFkU3RhdHVzQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblVucmVhZFN0YXR1c0NoYW5nZSh0aGlzLnN0YXRlLnVucmVhZFN0YXR1cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhbmRsZVRvdWNoVGFwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVRvdWNoVGFwKGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBUaGlzIHByZXZlbnRzIGdob3N0IGNsaWNrLlxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIC8vaWYodGhpcy5zdGF0ZS51bnJlYWRTdGF0dXMpe1xuICAgICAgICAgICAgLy90aGlzLnVwZGF0ZUFsZXJ0c0xhc3RSZWFkKCk7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgICAgIHRoaXMucmVsb2FkRGF0YSgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhbmNob3JFbDogZXZlbnQuY3VycmVudFRhcmdldCxcbiAgICAgICAgICAgICAgICB1bnJlYWRTdGF0dXM6IDBcbiAgICAgICAgICAgIH0sIHRoaXMub25TdGF0dXNDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhbmRsZVJlcXVlc3RDbG9zZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0Q2xvc2UoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBvcGVuOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5yZWxvYWRVbnJlYWQoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucHlkaW8ub2JzZXJ2ZSgnd2Vic29ja2V0X2V2ZW50OmFjdGl2aXR5JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzMy5zdGF0ZS5vcGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5yZWxvYWREYXRhKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbG9hZFVucmVhZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkJhZGdlLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWRnZUNvbnRlbnQ6IHRoaXMuc3RhdGUudW5yZWFkU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHRoaXMuc3RhdGUudW5yZWFkU3RhdHVzID8geyBwYWRkaW5nOiAnMCAyNHB4IDAgMCcgfSA6IHsgcGFkZGluZzogMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYmFkZ2VTdHlsZTogdGhpcy5zdGF0ZS51bnJlYWRTdGF0dXMgPyBudWxsIDogeyBkaXNwbGF5OiAnbm9uZScgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiB0aGlzLmhhbmRsZVRvdWNoVGFwLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lOiB0aGlzLnByb3BzLmljb25DbGFzc05hbWUgfHwgXCJpY29uLWJlbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuNCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAndXNlckFjdGlvbkJ1dHRvbiBhbGVydHNCdXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlOiB0aGlzLnByb3BzLmljb25TdHlsZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBvcG92ZXIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMuc3RhdGUub3BlbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvckVsOiB0aGlzLnN0YXRlLmFuY2hvckVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVxdWVzdENsb3NlOiB0aGlzLmhhbmRsZVJlcXVlc3RDbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6IDMyMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgekRlcHRoOiAyXG5cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5kYXRhICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9BY3Rpdml0eUxpc3QyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLnN0YXRlLmRhdGEuaXRlbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBvdmVyZmxvd1k6ICdzY3JvbGwnLCBtYXhIZWlnaHQ6IDMzMCwgcGFkZGluZ1RvcDogMjAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwQnlEYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheUNvbnRleHQ6IFwicG9wb3ZlclwiXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBVc2VyUGFuZWw7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVXNlclBhbmVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmUob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmpbXCJkZWZhdWx0XCJdIDogb2JqOyB9XG5cbnZhciBfSW5mb1BhbmVsID0gcmVxdWlyZShcIi4vSW5mb1BhbmVsXCIpO1xuXG5leHBvcnRzLkluZm9QYW5lbCA9IF9pbnRlcm9wUmVxdWlyZShfSW5mb1BhbmVsKTtcblxudmFyIF9Vc2VyUGFuZWwgPSByZXF1aXJlKFwiLi9Vc2VyUGFuZWxcIik7XG5cbmV4cG9ydHMuVXNlclBhbmVsID0gX2ludGVyb3BSZXF1aXJlKF9Vc2VyUGFuZWwpO1xuXG52YXIgX0NsaWVudCA9IHJlcXVpcmUoXCIuL0NsaWVudFwiKTtcblxuZXhwb3J0cy5BU0NsaWVudCA9IF9pbnRlcm9wUmVxdWlyZShfQ2xpZW50KTtcblxudmFyIF9BY3Rpdml0eSA9IHJlcXVpcmUoXCIuL0FjdGl2aXR5XCIpO1xuXG5leHBvcnRzLkFjdGl2aXR5ID0gX2ludGVyb3BSZXF1aXJlKF9BY3Rpdml0eSk7XG5cbnZhciBfQWN0aXZpdHlMaXN0ID0gcmVxdWlyZShcIi4vQWN0aXZpdHlMaXN0XCIpO1xuXG5leHBvcnRzLkFjdGl2aXR5TGlzdCA9IF9pbnRlcm9wUmVxdWlyZShfQWN0aXZpdHlMaXN0KTtcblxudmFyIF9MaXN0ZW5lciA9IHJlcXVpcmUoJy4vTGlzdGVuZXInKTtcblxuZXhwb3J0cy5MaXN0ZW5lciA9IF9pbnRlcm9wUmVxdWlyZShfTGlzdGVuZXIpO1xuXG52YXIgX0NhbGxiYWNrcyA9IHJlcXVpcmUoJy4vQ2FsbGJhY2tzJyk7XG5cbmV4cG9ydHMuQ2FsbGJhY2tzID0gX2ludGVyb3BSZXF1aXJlKF9DYWxsYmFja3MpO1xuIl19
