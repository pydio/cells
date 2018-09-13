import React from 'react'
import {Divider, TextField, FlatButton, IconButton, Toggle} from 'material-ui'
import DNs from './DNs'

class MemberOfPane extends React.Component{

    enableMapping(){
        const {config} = this.props;
        const m = new EnterpriseSDK.AuthLdapMemberOfMapping();
        m.Mapping = new EnterpriseSDK.AuthLdapMapping();
        m.GroupFilter = new EnterpriseSDK.AuthLdapSearchFilter();
        m.RealMemberOf = true;
        config.MemberOfMapping = m;
    }

    disableMapping(){
        const {config} = this.props;
        config.MemberOfMapping = null;
    }

    render(){
        const {titleStyle, legendStyle, style, config, divider} = this.props;
        const mOf = config.MemberOfMapping;
        let content;
        if(mOf){
            const rule = mOf.Mapping;
            const group = mOf.GroupFilter;
            content = (
                <div>
                    {divider}
                    <div>
                        <div style={titleStyle}>Mapping</div>
                        <div style={legendStyle}>                        
                            {pydio.MessageHash["ldap.31"]}
                        </div>
                        <div style={{display:'flex', alignItems:'baseline'}}>
                            <div style={{flex: 1, margin:'0 5px'}}>
                                <TextField fullWidth={1} floatingLabelText={"Left Attribute"} hintText={"Left Attribute"} value={rule.LeftAttribute} onChange={(e, val) => {rule.LeftAttribute=val}}/>
                            </div>
                            <div style={{flex: 2, margin:'0 5px'}}>
                                <TextField fullWidth={1} floatingLabelText={"Rule String"} hintText={"Rule String"} value={rule.RuleString} onChange={(e, val) => {rule.RuleString=val}}/>
                            </div>
                            <div style={{flex: 1, margin:'0 5px'}}>
                                <TextField fullWidth={1} floatingLabelText={"Right Attribute"} hintText={"Right Attribute"} value={rule.RightAttribute} onChange={(e, val) => {rule.RightAttribute=val}}/>
                            </div>
                        </div>
                    </div>
                    {divider}
                    <div>
                        <div style={{...titleStyle, marginTop: 20}}>Groups Filtering</div>
                        <div style={legendStyle}>
                        {pydio.MessageHash["ldap.32"]}                            
                        </div>
                        <DNs dns={group.DNs || ['']} onChange={(val) => {group.DNs = val}} pydio={pydio}/>
                        <TextField
                            fullWidth={true}
                            floatingLabelText={pydio.MessageHash["ldap.7"]}
                            value={group.Filter} onChange={(e,v) => {group.Filter = v}}
                        />
                        <TextField
                            fullWidth={true}
                            floatingLabelText={pydio.MessageHash["ldap.8"]}
                            value={group.IDAttribute} onChange={(e,v) => {group.IDAttribute = v}}
                        />
                        <TextField
                            fullWidth={true}
                            floatingLabelText={pydio.MessageHash["ldap.33"]}
                            value={group.DisplayAttribute} onChange={(e,v) => {group.DisplayAttribute = v}}
                        />
                    </div>
                    {divider}
                    <div>
                        <div style={{...titleStyle, marginTop: 20}}>MemberOf Attribute</div>
                        <div style={legendStyle}>
                            {pydio.MessageHash["ldap.34"]}
                        </div>
                        <div style={{height:50, display:'flex', alignItems:'center'}}>
                            <Toggle toggled={mOf.RealMemberOf} onToggle={(e,v) => { mOf.RealMemberOf = v; } } label={"Native MemberOf support"} labelPosition={"right"}/>
                        </div>
                        {mOf.RealMemberOf &&
                        <div>
                            <TextField
                                fullWidth={true}
                                floatingLabelText={pydio.MessageHash["ldap.35"]}
                                value={mOf.RealMemberOfAttribute} onChange={(e,v) => {mOf.RealMemberOfAttribute = v}}
                            />
                            <TextField
                                fullWidth={true}
                                floatingLabelText={pydio.MessageHash["ldap.36"]}
                                value={mOf.RealMemberOfValueFormat} onChange={(e,v) => {mOf.RealMemberOfValueFormat = v}}
                            />
                        </div>
                        }
                        {!mOf.RealMemberOf &&
                        <div>
                            <TextField
                                fullWidth={true}
                                floatingLabelText={pydio.MessageHash["ldap.37"]}
                                value={mOf.PydioMemberOfAttribute} onChange={(e,v) => {mOf.PydioMemberOfAttribute = v}}
                            />
                            <TextField
                                fullWidth={true}
                                floatingLabelText={pydio.MessageHash["ldap.38"]}
                                value={mOf.PydioMemberOfValueFormat} onChange={(e,v) => {mOf.PydioMemberOfValueFormat = v}}
                            />
                        </div>
                        }
                    </div>
                </div>
            );
        }



        return (
            <div style={style}>
                <div style={titleStyle}>{pydio.MessageHash["ldap.39"]}</div>
                <div style={legendStyle}>
                {pydio.MessageHash["ldap.40"]}
                </div>
                <div style={{height:50, display:'flex', alignItems:'center'}}>
                    <Toggle toggled={mOf} onToggle={(e,v) => { v ? this.enableMapping() : this.disableMapping() } } label={"Enable MemberOf Mapping"} labelPosition={"right"}/>
                </div>
                {content}
            </div>

        ) ;

    }

}

MemberOfPane.propTypes = {
    style: React.PropTypes.object
};

export {MemberOfPane as default}