import React from 'react'
import IdmObjectHelper from 'pydio/model/idm-object-helper';

class ChatUsers extends React.Component{

    render(){
        const {ACLs, roomUsers, pydio, style} = this.props;
        const styles = {
            user:{
                margin: 5,
                whiteSpace: 'nowrap',
                padding: '5px 10px',
                backgroundColor: 'rgb(255 255 255 / 53%)',
                borderRadius: 16
            },
            online:{
                color:'#4CAF50',
                marginLeft:5,
            },
            offline:{
                marginLeft:5,
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
                <span style={styles.user}>
                    {label}
                    {online !== undefined &&
                        <span className={"mdi mdi-checkbox-blank-circle" + (online?"":"-outline")} style={online?styles.online:styles.offline}/>
                    }
                    {online === undefined &&
                    <span className={"mdi mdi-account-multiple-outline"} style={styles.offline}/>
                    }
                </span>
            );

        });

        return <div style={{padding: 16, fontWeight: 500, color: '#757575', borderBottom:'1px solid #e0e0e0', ...style}}>{users}</div>

    }

}



export {ChatUsers as default}