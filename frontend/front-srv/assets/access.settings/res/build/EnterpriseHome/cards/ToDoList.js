'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var Paper = _require2.Paper;

var _require3 = require('react-chartjs');

var Doughnut = _require3.Doughnut;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var _require$requireLib2 = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib2.PydioContextConsumer;

var globalMessages = global.pydio.MessageHash;

var ToDoList = (function (_Component) {
    _inherits(ToDoList, _Component);

    function ToDoList(props, context) {
        _classCallCheck(this, ToDoList);

        _get(Object.getPrototypeOf(ToDoList.prototype), 'constructor', this).call(this, props, context);
        var _props = this.props;
        var preferencesProvider = _props.preferencesProvider;
        var widgetId = _props.widgetId;

        if (preferencesProvider) {
            var tasks = preferencesProvider.getUserPreference('ToDoList-' + widgetId);
            if (tasks && typeof tasks == "object") {
                this.state = { tasks: tasks, edit: false };
                return;
            }
        }
        this.state = {
            edit: false,
            tasks: [{
                label: this.props.getMessage("home.77", "ajxp_admin"),
                isDone: false
            }, {
                label: this.props.getMessage("home.77", "ajxp_admin") + " (" + this.props.getMessage("home.78", "ajxp_admin") + ")",
                isDone: true
            }]
        };
    }

    _createClass(ToDoList, [{
        key: 'addTask',
        value: function addTask() {
            if (this.refs.taskName.getValue().length == 0) return;
            var newTasks = this.state.tasks;
            newTasks.push({
                label: this.refs.taskName.getValue(),
                isDone: false
            });
            if (this.props.preferencesProvider) {
                this.props.preferencesProvider.saveUserPreference('ToDoList-' + this.props['widgetId'], newTasks);
            }
            this.setState({ tasks: newTasks });
            this.refs.taskName.setValue("");
        }
    }, {
        key: 'handleNewTaskKeyDown',
        value: function handleNewTaskKeyDown(event) {
            if (event.keyCode == 13) {
                this.addTask();
            }
        }
    }, {
        key: 'removeTask',
        value: function removeTask(index) {
            var tasks = this.state.tasks;
            var newTasks = [];
            for (var i = 0; i < tasks.length; i++) if (i != index) newTasks.push(tasks[i]);
            if (this.props.preferencesProvider) {
                this.props.preferencesProvider.saveUserPreference('ToDoList-' + this.props['widgetId'], newTasks);
            }
            this.setState({ tasks: newTasks });
        }
    }, {
        key: 'changeTaskState',
        value: function changeTaskState(index) {
            var tasks = this.state.tasks;
            var newTasks = [];
            for (var i = 0; i < tasks.length; i++) if (i == index) newTasks.push({ label: tasks[i].label, isDone: !tasks[i].isDone });else newTasks.push(tasks[i]);
            if (this.props.preferencesProvider) {
                this.props.preferencesProvider.saveUserPreference('ToDoList-' + this.props['widgetId'], newTasks);
            }
            this.setState({ tasks: newTasks });
        }
    }, {
        key: 'render',
        value: function render() {
            var index = -1;
            var tasks = this.state.tasks.map((function (item) {
                index++;
                var taskLabel;
                if (item.isDone) taskLabel = React.createElement(
                    'p',
                    { className: 'task-done', title: item.label },
                    item.label
                );else taskLabel = React.createElement(
                    'p',
                    { title: item.label },
                    item.label
                );

                return React.createElement(
                    'div',
                    {
                        className: 'todo-item', key: "task" + index },
                    React.createElement(ReactMUI.Checkbox, {
                        onClick: this.changeTaskState.bind(this, index),

                        checked: item.isDone
                    }),
                    taskLabel,
                    React.createElement('span', {
                        onClick: this.removeTask.bind(this, index),
                        className: 'icon-remove button-icon delete-todo-item-button'
                    })
                );
            }).bind(this));
            var addBar = React.createElement(
                'div',
                { className: 'todo-add-bar' },
                React.createElement(ReactMUI.TextField, { onKeyDown: this.handleNewTaskKeyDown.bind(this), hintText: globalMessages['ajxp_admin.home.76'], ref: 'taskName' })
            );
            return React.createElement(
                Paper,
                _extends({}, this.props, {
                    className: 'todo-list',
                    zDepth: 1,
                    transitionEnabled: false
                }),
                this.props.buttons,
                React.createElement(
                    'h4',
                    null,
                    this.props.title
                ),
                addBar,
                React.createElement(
                    'div',
                    { className: 'tasks-list' },
                    tasks
                )
            );
        }
    }]);

    return ToDoList;
})(Component);

ToDoList.propTypes = {
    title: PropTypes.string
};

exports['default'] = ToDoList = PydioContextConsumer(ToDoList);
exports['default'] = ToDoList = asGridItem(ToDoList, globalMessages['ajxp_admin.home.75'], { gridWidth: 3, gridHeight: 20 }, [{ name: 'title', label: globalMessages['ajxp_admin.home.30'], type: 'string', mandatory: true, 'default': globalMessages['ajxp_admin.home.75'] }]);

exports['default'] = ToDoList;
module.exports = exports['default'];
