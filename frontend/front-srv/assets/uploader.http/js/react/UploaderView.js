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

(function(global){

    var Uploader = React.createClass({

        getInitialState: function () {
            return {
                dir: pydio.getContextNode().getPath(),
                submitting: false,
                currentURL: "",
                urls: []
            }
        },

        _handleChangeURL: function(id) {
            return function(e, newValue) {

                if (this.state.submitting) return

                if (newValue === "") {
                    this._handleDeleteURL(id)();
                    return
                }

                const {urls} = this.state

                urls[id] = newValue
                this.setState({
                    urls: urls
                })
            }.bind(this)
        },

        _handleDeleteURL: function(id) {
            return function() {
                if (this.state.submitting) return

                const {urls} = this.state

                urls.splice(id, 1)

                this.setState({
                    urls: urls
                })
            }.bind(this)
        },

        _handleChangeCurrentURL: function(e, value) {
            this.setState({
                currentURL: value
            });
        },

        _handleAddURL: function(e) {

            if (this.state.submitting) return

            if (e.type == "keydown" && e.keyCode !== 13) return

            const {currentURL, urls} = this.state

            if (currentURL === "") return

            urls.push(currentURL)

            this.setState({
                currentURL: "",
                urls: urls
            })
        },

        _handleSubmit: function(e) {

            e.preventDefault()
            e.stopPropagation()

            const {dir, urls} = this.state

            this.setState({
                urls: urls.filter(function(item, id) {
                    PydioApi.getClient().request({get_action:'external_download', file:item, dir:dir}, function(t){
                        PydioApi.getClient().parseXmlMessage(t.responseXML);
                    });

                    return false;
                })
            })
        },

        render: function(){

            let options;
            let messages = global.pydio.MessageHash;

            const style = {
                marginLeft: 24
            };

            let urls = this.state.urls

            let items = urls.map(function(item, id) {
                return (
                    <div>
                        <div style={{display:'flex', justifyContent: 'space-between', padding: '0px 24px', width: '100%', height: '100%'}}>
                            <MaterialUI.TextField disabled={this.state.submitting} style={{display:'flex', alignItems: 'center'}} value={item} underlineShow={false} fullWidth={true} onChange={this._handleChangeURL(id)} />
                            <MaterialUI.FontIcon style={{display:'flex', alignItems: 'center', fontSize: '1em'}} className="icon-remove" onClick={this._handleDeleteURL(id)} />
                        </div>
                        <MaterialUI.Divider />
                    </div>
                )
            }.bind(this));

            return (
                <div style={{position:'relative', padding: '10px'}}>
                    <div style={{position:'relative', margin: '10px'}} className="dialoglegend">{messages['httpdownloader.4']}</div>
                    <MaterialUI.Paper zDepth={1}>
                        {items}

                        <MaterialUI.TextField disabled={this.state.submitting} hintText={messages['httpdownloader.5']} style={style} value={this.state.currentURL} underlineShow={false} fullWidth={true} onChange={this._handleChangeCurrentURL} onKeyDown={this._handleAddURL} onBlur={this._handleAddURL} />
                        <MaterialUI.Divider />
                    </MaterialUI.Paper>

                    {urls.length > 0 &&
                        <MaterialUI.Toolbar style={{backgroundColor: '#fff'}}>
                            <div style={{display:'flex', justifyContent: 'space-between', padding: '0px 24px', width: '100%', height: '100%'}}>
                                <div style={{display:'flex', alignItems: 'center', marginLeft: '-48px'}}>
                                    <MaterialUI.RaisedButton primary={true} label="Start" onClick={this._handleSubmit}/>
                                </div>
                            </div>
                        </MaterialUI.Toolbar>
                    }
                </div>
            );
        }
    });

    var ns = global.HTTPUploaderView || {};
    ns.Uploader = Uploader;
    global.HTTPUploaderView = ns;

})(window);
