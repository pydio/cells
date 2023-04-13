import React, {createRef} from 'react'
import DOMUtils from 'pydio/util/dom'
import IdmObjectHelper from 'pydio/model/idm-object-helper';

class ChatUsers extends React.Component{

    constructor(props) {
        super(props);
        this.container = createRef()
    }

    render(){
        const {ACLs, roomUsers, pydio, style, muiTheme} = this.props;
        const {hover = false} = this.state || {};
        const styles = {
            container: {
                padding: 16,
                fontWeight: 500,
                height: 48,
                transition: DOMUtils.getBeziersTransition(),
                overflowY: 'auto',
                ...style
            },
            user:{
                margin: 5,
                whiteSpace: 'nowrap',
                padding: '4px 10px',
                backgroundColor: muiTheme.darkMode? 'rgba(255, 255, 255, .23)':'rgba(0, 0, 0, .1)',
                borderRadius: 6
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
            return {online, label}
        });
        users.sort((a,b)=>{
            if(a.online) {
                return -1
            } else if(b.online) {
                return 1
            } else {
                return 0
            }
        })

        let contStyle = {...styles.container}
        if(this.container.current){
            if(hover){
                contStyle = {...contStyle, height: this.container.current.scrollHeight}
            } else if(this.container.current.scrollHeight > 60) {
                contStyle = {...contStyle, height: 56}
            }
        }

        return (
            <div
                ref={this.container}
                onMouseEnter={() => this.setState({hover: true})}
                onMouseLeave={() => this.setState({hover: false})}
                style={contStyle}
            >{users.map(u => {
                const {label, online} = u;
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

            })}</div>
        )

    }

}



export {ChatUsers as default}