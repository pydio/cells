'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var FreeMaskLine = React.createClass({
    displayName: 'FreeMaskLine',

    propTypes: {
        path: React.PropTypes.string,
        mask: React.PropTypes.object
    },

    onCbChecked: function onCbChecked(type, event, newValue) {
        var newMask = LangUtils.deepCopy(this.props.mask);
        var perm = newMask[this.props.path] || {};
        perm[type] = newValue;
        newMask[this.props.path] = perm;
        this.props.onMaskChange(newMask);
    },

    onPathChanged: function onPathChanged(event) {
        var newPath = event.target.getValue();
        FuncUtils.bufferCallback('path-changed', 750, (function () {
            this.propagatePathChange(newPath);
        }).bind(this));
    },

    propagatePathChange: function propagatePathChange(newPath) {
        var newMask = {};
        Object.keys(this.props.mask).map((function (k) {
            if (k == this.props.path) newMask[newPath] = this.props.mask[k];else newMask[k] = this.props.mask[k];
        }).bind(this));
        this.props.onMaskChange(newMask);
    },

    onRemove: function onRemove() {
        var newMask = LangUtils.deepCopy(this.props.mask);
        if (newMask[this.props.path]) {
            delete newMask[this.props.path];
        }
        this.props.onMaskChange(newMask);
    },

    render: function render() {
        var perm = this.props.parentMask ? this.props.parentMask[this.props.path] : this.props.mask[this.props.path];
        return React.createElement(
            'div',
            { className: "mui-menu-item tree-item has-checkboxes", style: { paddingLeft: '4px', width: '100%' } },
            React.createElement(ReactMUI.IconButton, { iconClassName: 'icon-minus', onClick: this.onRemove, className: 'smaller-button' }),
            React.createElement(ReactMUI.TextField, { defaultValue: this.props.path, className: 'tree-item-label', onChange: this.onPathChanged }),
            React.createElement(
                'div',
                { className: "tree-checkboxes" + (this.props.className ? ' ' + this.props.className : '') },
                React.createElement(ReactMUI.Checkbox, { className: 'cbox-read', checked: perm['read'], onCheck: this.onCbChecked.bind(this, "read") }),
                React.createElement(ReactMUI.Checkbox, { className: 'cbox-write', checked: perm['write'], onCheck: this.onCbChecked.bind(this, "write") }),
                React.createElement(ReactMUI.Checkbox, { className: 'cbox-deny', checked: perm['deny'], onCheck: this.onCbChecked.bind(this, "deny") }),
                React.createElement(ReactMUI.Checkbox, { className: 'cbox-children', checked: perm['children'], onCheck: this.onCbChecked.bind(this, "children") })
            )
        );
    }

});

var PermissionMaskEditorFree = React.createClass({
    displayName: 'PermissionMaskEditorFree',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        workspaceId: React.PropTypes.string,

        /* Global permissions may override the folders rights */
        globalWorkspacePermissions: React.PropTypes.object,
        showGlobalPermissions: React.PropTypes.bool,
        onGlobalPermissionsChange: React.PropTypes.func,

        /* Folders mask and parentMask */
        mask: React.PropTypes.object,
        parentMask: React.PropTypes.object,
        onMaskChange: React.PropTypes.func,

        /* Maybe used to alert about inconsistencies */
        showModal: React.PropTypes.func,
        hideModal: React.PropTypes.func
    },

    onClickAdd: function onClickAdd() {
        var test = '/new-path',
            testBase = '/new-path',
            index = 1;
        while (this.props.mask[test]) {
            test = testBase + '-' + index;
            index++;
        }
        this.props.mask[test] = {};
        this.onMaskChange(this.props.mask);
    },

    onMaskChange: function onMaskChange(newMask) {
        this.props.onMaskChange(newMask);
    },

    render: function render() {

        var parentMask = this.props.parentMask || {};
        var mask = this.props.mask;
        var lines = [];

        var mainClassNames = global.classNames("permission-mask-editor", { "permission-mask-global-noread": this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.read }, { "permission-mask-global-nowrite": this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.write });

        Object.keys(parentMask).map((function (path) {
            if (!mask[path]) {
                lines.push(React.createElement(FreeMaskLine, {
                    key: path,
                    path: path,
                    parentMask: parentMask,
                    mask: mask,
                    onMaskChange: this.onMaskChange,
                    className: 'parent-inherited'
                }));
            }
        }).bind(this));

        Object.keys(mask).map((function (path) {
            lines.push(React.createElement(FreeMaskLine, {
                key: path,
                path: path,
                mask: mask,
                onMaskChange: this.onMaskChange
            }));
        }).bind(this));

        return React.createElement(
            'div',
            { className: mainClassNames },
            React.createElement(
                'div',
                { className: 'read-write-header' },
                React.createElement(
                    'span',
                    { className: 'header-read' },
                    this.context.getMessage('react.5a', 'ajxp_admin')
                ),
                React.createElement(
                    'span',
                    { className: 'header-write' },
                    this.context.getMessage('react.5b', 'ajxp_admin')
                ),
                React.createElement(
                    'span',
                    { className: 'header-deny' },
                    this.context.getMessage('react.5', 'ajxp_admin')
                ),
                React.createElement(
                    'span',
                    { className: 'header-children' },
                    this.context.getMessage('react.6', 'ajxp_admin')
                )
            ),
            React.createElement(
                'div',
                null,
                lines
            ),
            React.createElement(
                'div',
                { style: { clear: 'both', textAlign: 'center', padding: '10px' } },
                React.createElement(
                    ReactMUI.FlatButton,
                    { onClick: this.onClickAdd, className: 'smaller-button' },
                    React.createElement(ReactMUI.FontIcon, { className: 'icon-plus' }),
                    ' ',
                    this.context.getMessage('react.7', 'ajxp_admin')
                )
            )
        );
    }
});

exports['default'] = PermissionMaskEditorFree;
module.exports = exports['default'];
