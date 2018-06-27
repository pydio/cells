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

export default React.createClass({

    propTypes: {
        floatingLabelText: React.PropTypes.string,

        inputValue: React.PropTypes.string,
        inputClassName: React.PropTypes.string,
        getMessage: React.PropTypes.func,
        inputCopyMessage: React.PropTypes.string
    },

    getInitialState: function(){
        return {copyMessage: null};
    },

    componentDidMount:function(){
        this.attachClipboard();
    },
    componentDidUpdate:function(){
        this.attachClipboard();
    },

    attachClipboard:function(){
        if(this._clip){
            this._clip.destroy();
        }
        if(!this.refs['copy-button']) {
            return;
        }
        this._clip = new Clipboard(this.refs['copy-button'], {
            text: function(trigger) {
                return this.props.inputValue;
            }.bind(this)
        });
        this._clip.on('success', function(){
            this.setState({copyMessage:this.props.getMessage(this.props.inputCopyMessage || '192')}, this.clearCopyMessage);
        }.bind(this));
        this._clip.on('error', function(){
            var copyMessage;
            if( global.navigator.platform.indexOf("Mac") === 0 ){
                copyMessage = this.props.getMessage('144');
            }else{
                copyMessage = this.props.getMessage('143');
            }
            this.refs['input'].focus();
            this.setState({copyMessage:copyMessage}, this.clearCopyMessage);
        }.bind(this));
    },

    clearCopyMessage:function(){
        global.setTimeout(function(){
            this.setState({copyMessage:''});
        }.bind(this), 3000);
    },

    render: function(){

        let select = function(e){
            e.currentTarget.select();
        };

        let copyMessage = null;
        if(this.state.copyMessage){
            var setHtml = function(){
                return {__html:this.state.copyMessage};
            }.bind(this);
            copyMessage = <div style={{color:'rgba(0,0,0,0.23)'}} className="copy-message" dangerouslySetInnerHTML={setHtml()}/>;
        }

        const buttonStyle = {
            position    :'absolute',
            right: -8,
            bottom: 13,
            fontSize: 15,
            color: this.props.buttonColor || 'rgba(0, 150, 136, 0.52)',
            height: 26,
            width: 26,
            lineHeight: '28px',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            ...this.props.buttonStyle
        };


        return (
            <div>
                <div style={{position:'relative'}}>
                    <MaterialUI.TextField
                        fullWidth={true}
                        ref="input"
                        floatingLabelText={this.props.floatingLabelText}
                        floatingLabelStyle={{whiteSpace:'nowrap'}}
                        underlineShow={this.props.underlineShow}
                        defaultValue={this.props.inputValue}
                        className={this.props.inputClassName}
                        multiLine={this.props.multiLine}
                        rows={this.props.rows}
                        rowsMax={this.props.rowsMax}
                        readOnly={true}
                        onClick={select}
                        style={{marginTop:-10, width: '92%', fontSize:14}}
                    />
                    <span ref="copy-button" style={buttonStyle} title={this.props.getMessage('191')} className="copy-button mdi mdi-content-copy"/>
                </div>
                {copyMessage}
            </div>
        );
    }

});
