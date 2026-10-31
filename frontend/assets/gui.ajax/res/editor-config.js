// Copyright (c) 2026. Pydio Cells Personal Fork contributors.
// Configuration panel for Euro-Office editor settings

(function(exports) {
  "use strict";
  var Pydio = this && this.Pydio || require('pydio');
  var React = this && this.React || require('react');
  var {connect} = this && this.connect || require('react-redux');

  var {EditorActions} = Pydio.requireLib('hoc');

  @connect(null, EditorActions)
  class EditorConfig extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showEuroOffice: true,
        defaultEditor: 'eurooffice',
        extensions: ['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'pdf'],
        maxFileSize: 50,
        enableCollaboration: true,
        sessionTimeout: 3600
      };
    }

    handleToggleEuroOffice = (event) => {
      const checked = event.target.checked;
      this.setState({showEuroOffice: checked});
      // Save preference
      this.props.pydio.setUserPreference('editor_preference', checked ? 'eurooffice' : 'libreoffice');
    }

    handleEditorChange = (event) => {
      this.setState({defaultEditor: event.target.value});
    }

    handleSave = () => {
      const {showEuroOffice, defaultEditor, extensions, maxFileSize, enableCollaboration, sessionTimeout} = this.state;
      const prefs = this.props.pydio.getUserPreferences();

      // Update user preferences
      const newPrefs = {
        ...prefs,
        editor_preference: defaultEditor,
        eurooffice_enabled: showEuroOffice
      };
      this.props.pydio.setUserPreferences(newPrefs);

      // Show success message
      this.props.pydio.notify('settings_saved', {
        message: 'Euro-Office settings saved successfully'
      });
    }

    render() {
      const {showEuroOffice, defaultEditor, maxFileSize, enableCollaboration, sessionTimeout} = this.state;

      return (
        <div className="editor-config-panel" style={{padding: 24}}>
          <h3>Euro-Office Editor Settings</h3>

          <div className="form-group">
            <label style={{display: 'block', marginBottom: 8}}>
              <input
                type="checkbox"
                checked={showEuroOffice}
                onChange={this.handleToggleEuroOffice}
                style={{marginRight: 8}}
              />
              Enable Euro-Office editor
            </label>
          </div>

          <div className="form-group">
            <label style={{display: 'block', marginBottom: 8}}>Default editor:</label>
            <select
              value={defaultEditor}
              onChange={this.handleEditorChange}
              style={{width: '100%', padding: 8, marginTop: 4}}
            >
              <option value="eurooffice">Euro-Office (Preferred)</option>
              <option value="libreoffice">LibreOffice (Fallback)</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{display: 'block', marginBottom: 8}}>File extensions (comma-separated):</label>
            <input
              type="text"
              value={extensions.join(', ')}
              onChange={(e) => this.setState({extensions: e.target.value.split(',').map(ext => ext.trim()).filter(Boolean)}})
              style={{width: '100%', padding: 8, marginTop: 4}}
            />
          </div>

          <div className="form-group">
            <label style={{display: 'block', marginBottom: 8}}>Max file size (MB):</label>
            <input
              type="number"
              value={maxFileSize}
              onChange={(e) => this.setState({maxFileSize: parseInt(e.target.value) || 50})}
              style={{width: '100%', padding: 8, marginTop: 4}}
            />
          </div>

          <div className="form-group">
            <label style={{display: 'block', marginBottom: 8}}>
              <input
                type="checkbox"
                checked={enableCollaboration}
                onChange={() => this.setState({enableCollaboration: !enableCollaboration})}
                style={{marginRight: 8}}
              />
              Enable real-time collaboration
            </label>
          </div>

          <div className="form-group">
            <label style={{display: 'block', marginBottom: 8}}>
              Session timeout (seconds):
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => this.setState({sessionTimeout: parseInt(e.target.value) || 3600})}
                style={{width: '100%', padding: 8, marginTop: 4}}
              />
            </label>
          </div>

          <button
            onClick={this.handleSave}
            style={{marginTop: 16, padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}
          >
            Save Settings
          </button>
        </div>
      );
    }
  }

  exports.EditorConfig = EditorConfig;
}.call(this);