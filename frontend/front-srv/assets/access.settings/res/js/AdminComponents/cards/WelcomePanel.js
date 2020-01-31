import AdminStyles from "../board/AdminStyles";
import Pydio from 'pydio'
const {Component} = require('react');
const {Paper, FlatButton} = require('material-ui');

const {asGridItem} = require('pydio').requireLib('components');
const {PydioContextConsumer} = require('pydio').requireLib('boot');

const globalMessages = Pydio.getInstance().MessageHash;

class WelcomePanel extends Component{

    render(){
        const adminStyles = AdminStyles();
        return (
            <Paper
                {...this.props}
                className="welcome-panel"
                {...adminStyles.body.block.props}
                style={{...adminStyles.body.block.container, margin:0, ...this.props.style}}
                transitionEnabled={false}
            >
                {this.props.closeButton}
                <div className="screencast">
                    <img src="plug/access.ajxp_admin/images/screencast.gif"/>
                </div>
                <h4>{this.props.getMessage("home.44")}</h4>
                <div className="getting-started-content" dangerouslySetInnerHTML={{__html:this.props.getMessage('home.getting_started')}}></div>
                <FlatButton
                    style={{position: 'absolute', right: 10, bottom: 10}}
                    primary={true}
                    label={this.props.getMessage('home.45')}
                    onTouchTap={this.props.onCloseAction}
                />
            </Paper>
        );
    }

}

WelcomePanel = PydioContextConsumer(WelcomePanel);
WelcomePanel = asGridItem(
    WelcomePanel,
    globalMessages['ajxp_admin.home.44'],
    {gridWidth:8,gridHeight:15},
    []
);


export {WelcomePanel as default}