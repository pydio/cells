import React from 'react'
import IdmObjectHelper from 'pydio/model/idm-object-helper';

class ChatUsers extends React.Component{

    render(){
        const {ACLs, roomUsers, pydio} = this.props;
        const style = {
            user:{
                marginRight: 10,
                whiteSpace: 'nowrap'
            },
            online:{
                color:'#4CAF50',
                marginRight:5,
            },
            offline:{
                marginRight:5,
            }
        };

        const users = Object.keys(ACLs).map(roleId => {
            const acl = ACLs[roleId];
            let online;
            const label = IdmObjectHelper.extractLabel(pydio, acl);
            if(acl.User){
                online = roomUsers && roomUsers.indexOf(acl.User.Login) > -1;
            }
            return (
                <span style={style.user}>
                    {online !== undefined &&
                        <span className={"mdi mdi-checkbox-blank-circle" + (online?"":"-outline")} style={online?style.online:style.offline}/>
                    }
                    {online === undefined &&
                    <span className={"mdi mdi-account-multiple-outline"} style={style.offline}/>
                    }
                    {label}
                </span>
            );

        });

        return <div style={{padding: 16, fontWeight: 500, color: '#757575', borderBottom:'1px solid #e0e0e0'}}>{users}</div>

    }

}



export {ChatUsers as default}