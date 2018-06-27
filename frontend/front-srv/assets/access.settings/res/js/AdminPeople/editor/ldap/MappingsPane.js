import React from 'react'
import {TextField, FlatButton, IconButton} from 'material-ui'
import {AuthLdapServerConfig, AuthLdapMapping} from 'pydio/http/rest-api'

class MappingsPane extends React.Component{

    addRule(){
        const {config} = this.props;
        const rules = config.MappingRules || [];
        config.MappingRules = [...rules, new AuthLdapMapping()];
    }

    removeRule(index){
        const {config} = this.props;
        config.MappingRules = [
            ...config.MappingRules.slice(0, index),
            ...config.MappingRules.slice(index + 1)
        ];
    }

    render(){
        const {style, config, titleStyle, legendStyle, pydio} = this.props;
        const rules = config.MappingRules || [];        

        return (
            <div style={{...style}}>
                <div style={titleStyle}>{pydio.MessageHash["ldap.29"]}</div>
                <div style={legendStyle}>
                {pydio.MessageHash["ldap.30"]}
                </div>
                {rules.map((rule, k) => {
                    return (
                        <div style={{display:'flex', alignItems:k===0 ? 'baseline': 'center'}}>
                            <div style={{flex: 1, margin:'0 5px'}}>
                                <TextField fullWidth={1} floatingLabelText={k === 0 ? "Left Attribute":undefined} hintText={k > 0 ? "Left Attribute":undefined} value={rule.LeftAttribute} onChange={(e, val) => {rule.LeftAttribute=val}}/>
                            </div>
                            <div style={{flex: 2, margin:'0 5px'}}>
                                <TextField fullWidth={1} floatingLabelText={k === 0 ? "Rule String":undefined} hintText={k > 0 ? "Rule String" : undefined} value={rule.RuleString} onChange={(e, val) => {rule.RuleString=val}}/>
                            </div>
                            <div style={{flex: 1, margin:'0 5px'}}>
                                <TextField fullWidth={1} floatingLabelText={k === 0 ? "Right Attribute":undefined} hintText={k > 0 ? "Right Attribute" : undefined} value={rule.RightAttribute} onChange={(e, val) => {rule.RightAttribute=val}}/>
                            </div>
                            <IconButton iconClassName={"mdi mdi-delete"} onTouchTap={() => {this.removeRule(k)}}/>
                        </div>
                    );
                })}
                <div style={{padding: 20, textAlign:'center'}}><FlatButton label={pydio.MessageHash["ldap.27"]} onTouchTap={() => {this.addRule()}}/></div>
            </div>

        ) ;

    }

}

MappingsPane.propTypes = {
    style: React.PropTypes.object,
    config: React.PropTypes.instanceOf(AuthLdapServerConfig)
};

export {MappingsPane as default}