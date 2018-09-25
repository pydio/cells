'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _Field = require('./Field');

var _Field2 = _interopRequireDefault(_Field);

var _Permissions = require('./Permissions');

var _Permissions2 = _interopRequireDefault(_Permissions);

var _TargetedUsers = require('./TargetedUsers');

var _TargetedUsers2 = _interopRequireDefault(_TargetedUsers);

var _materialUi = require('material-ui');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _compositeCompositeModel = require('../composite/CompositeModel');

var _compositeCompositeModel2 = _interopRequireDefault(_compositeCompositeModel);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var PublicLinkPanel = _react2['default'].createClass({
    displayName: 'PublicLinkPanel',

    propTypes: {
        linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default']),
        compositeModel: _react2['default'].PropTypes.instanceOf(_compositeCompositeModel2['default']),
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),
        authorizations: _react2['default'].PropTypes.object,
        showMailer: _react2['default'].PropTypes.func
    },

    toggleLink: function toggleLink() {
        var _props = this.props;
        var linkModel = _props.linkModel;
        var pydio = _props.pydio;
        var showTemporaryPassword = this.state.showTemporaryPassword;

        if (showTemporaryPassword) {
            this.setState({ showTemporaryPassword: false, temporaryPassword: null });
        } else if (!linkModel.getLinkUuid() && _mainShareHelper2['default'].getAuthorizations(pydio).password_mandatory) {
            this.setState({ showTemporaryPassword: true, temporaryPassword: '' });
        } else {
            if (linkModel.getLinkUuid()) {
                this.props.compositeModel.deleteLink(linkModel);
            } else {
                linkModel.save();
            }
        }
    },

    getInitialState: function getInitialState() {
        return { showTemporaryPassword: false, temporaryPassword: null, disabled: false };
    },

    updateTemporaryPassword: function updateTemporaryPassword(value, event) {
        if (value === undefined) {
            value = event.currentTarget.getValue();
        }
        this.setState({ temporaryPassword: value });
    },

    enableLinkWithPassword: function enableLinkWithPassword() {
        var linkModel = this.props.linkModel;

        if (!this.refs['valid-pass'].isValid()) {
            this.props.pydio.UI.displayMessage('ERROR', 'Invalid Password');
            return;
        }
        linkModel.setCreatePassword(this.state.temporaryPassword);
        try {
            linkModel.save();
        } catch (e) {
            this.props.pydio.UI.displayMessage('ERROR', e.message);
        }
        this.setState({ showTemporaryPassword: false, temporaryPassword: null });
    },

    render: function render() {
        var _props2 = this.props;
        var linkModel = _props2.linkModel;
        var pydio = _props2.pydio;
        var compositeModel = _props2.compositeModel;

        var authorizations = _mainShareHelper2['default'].getAuthorizations(pydio);
        var nodeLeaf = compositeModel.getNode().isLeaf();
        var canEnable = nodeLeaf && authorizations.file_public_link || !nodeLeaf && authorizations.folder_public_link;

        var publicLinkPanes = undefined,
            publicLinkField = undefined;
        if (linkModel.getLinkUuid()) {
            publicLinkField = _react2['default'].createElement(_Field2['default'], {
                pydio: pydio,
                linkModel: linkModel,
                showMailer: this.props.showMailer,
                editAllowed: authorizations.editable_hash && linkModel.isEditable(),
                key: 'public-link'
            });
            publicLinkPanes = [_react2['default'].createElement(_materialUi.Divider, null), _react2['default'].createElement(_Permissions2['default'], {
                compositeModel: compositeModel,
                linkModel: linkModel,
                pydio: pydio,
                key: 'public-perm'
            })];
            if (linkModel.getLink().TargetUsers) {
                publicLinkPanes.push(_react2['default'].createElement(_materialUi.Divider, null));
                publicLinkPanes.push(_react2['default'].createElement(_TargetedUsers2['default'], { linkModel: linkModel, pydio: pydio }));
            }
        } else if (this.state.showTemporaryPassword) {
            publicLinkField = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { className: 'section-legend', style: { marginTop: 20 } },
                    this.props.getMessage('215')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { width: '100%' } },
                    _react2['default'].createElement(ValidPassword, {
                        attributes: { label: this.props.getMessage('23') },
                        value: this.state.temporaryPassword,
                        onChange: this.updateTemporaryPassword,
                        ref: "valid-pass"
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'center', marginTop: 20 } },
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: this.props.getMessage('92'), secondary: true,
                        onClick: this.enableLinkWithPassword })
                )
            );
        } else if (!canEnable) {
            publicLinkField = _react2['default'].createElement(
                'div',
                { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)', paddingBottom: 16, paddingTop: 16 } },
                this.props.getMessage(nodeLeaf ? '225' : '226')
            );
        } else {
            publicLinkField = _react2['default'].createElement(
                'div',
                { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)', paddingBottom: 16, paddingTop: 16 } },
                this.props.getMessage('190')
            );
        }
        return _react2['default'].createElement(
            'div',
            { style: this.props.style },
            _react2['default'].createElement(
                'div',
                { style: { padding: '15px 10px 11px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', fontSize: 15 } },
                _react2['default'].createElement(_materialUi.Toggle, {
                    disabled: this.props.isReadonly() || this.state.disabled || !linkModel.isEditable() || !linkModel.getLinkUuid() && !canEnable,
                    onToggle: this.toggleLink,
                    toggled: linkModel.getLinkUuid() || this.state.showTemporaryPassword,
                    label: this.props.getMessage('189')
                })
            ),
            _react2['default'].createElement(
                'div',
                { style: { padding: 20 } },
                publicLinkField
            ),
            publicLinkPanes
        );
    }
});

exports['default'] = PublicLinkPanel = (0, _ShareContextConsumer2['default'])(PublicLinkPanel);
exports['default'] = PublicLinkPanel;
module.exports = exports['default'];
