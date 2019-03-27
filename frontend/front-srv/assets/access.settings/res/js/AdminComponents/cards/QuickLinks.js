const {Component,PropTypes} = require('react')
const {DropDownMenu, MenuItem, FlatButton, Paper, IconButton} = require('material-ui')
const {asGridItem} = require('pydio').requireLib('components')
const {PydioContextConsumer} = require('pydio').requireLib('boot')
import NavigationHelper from '../util/NavigationHelper'

class QuickLinks extends Component{

    constructor(props, context){
        super(props, context);

        const {preferencesProvider, getMessage} = props;

        if(preferencesProvider){
            const links = preferencesProvider.getUserPreference('QuickLinks');
            if(links && typeof links === "object"){
                this.state = {links:links, edit:false};
                return;
            }
        }

        this.state = {
            edit:false,
            links:[
                {
                    path:'/idm/users',
                    iconClass:'mdi mdi-account',
                    label:getMessage('2', 'settings'),
                    description:getMessage('139', 'settings')
                },
                {
                    path:'/data/workspaces',
                    iconClass:'mdi mdi-network',
                    label:getMessage('3', 'settings'),
                    description:getMessage('138', 'settings')
                }
            ]
        };
    }

    menuClicked(event, index, node){

        if(node !== -1){
            let newLinks = [...this.state.links];
            let already = false;
            newLinks.forEach(function(l){
                if(l.path == node.getPath()) already = true;
            });
            if(already) return;
            newLinks.push({
                path        : node.getPath(),
                label       : node.getLabel().replace('---', ''),
                description : node.getMetadata().get('description'),
                iconClass   : node.getMetadata().get('icon_class')
            });
            if(this.props.preferencesProvider){
                this.props.preferencesProvider.saveUserPreference('QuickLinks', newLinks);
            }
            this.setState({links:newLinks});
        }

    }

    removeLink(payload, event){

        const links = this.state.links;
        let newLinks = [];
        links.map(function(l){
            if(l.path != payload) newLinks.push(l);
        });
        if(this.props.preferencesProvider){
            this.props.preferencesProvider.saveUserPreference('QuickLinks', newLinks);
        }
        this.setState({links:newLinks});

    }

    toggleEdit(){
        if(!this.state.edit){
            this.props.onFocusItem();
        }else{
            this.props.onBlurItem();
        }
        this.setState({edit:!this.state.edit});
    }

    render(){
        const {muiTheme, pydio} = this.props;

        const links = this.state.links.map(function(l){
            let label;
            if(this.state.edit){
                label = <span style={{color:'#9e9e9e'}}><span className={'mdi mdi-delete'}></span> {l.label}</span>
                return(
                    <FlatButton
                        key={l.path}
                        secondary={false}
                        onTouchTap={this.removeLink.bind(this, l.path)}
                        label={label}
                    />
                );
            }else{
                label = <span><span className={l.iconClass + ' button-icon'}></span> {l.label}</span>
                return(
                    <FlatButton
                        key={l.path}
                        primary={true}
                        onTouchTap={function(){pydio.goTo(l.path);}}
                        label={label}
                    />
                );
            }
        }.bind(this));
        let dropDown;
        if(this.state.edit){
            let menuItems = [<MenuItem primaryText={this.props.getMessage('home.43')} value="-1"/>];
            const rootNode = pydio.getContextHolder().getRootNode();
            menuItems = menuItems.concat(NavigationHelper.buildNavigationItems(pydio, rootNode, muiTheme.palette, true, true));
            dropDown = (
                <div>
                    <DropDownMenu
                        style={{marginTop: 6}}
                        underlineStyle={{display:'none'}}
                        onChange={this.menuClicked.bind(this)}
                        value="-1">{menuItems}</DropDownMenu>
                </div>
            );
        }else{
            dropDown = <h4 style={{padding: '15px 6px 0', fontWeight: 500, color: '#9e9e9e', fontSize: 15, textTransform: 'uppercase'}}>{this.props.getMessage('home.1')}</h4>;
        }
        return (
            <Paper
                {...this.props}
                zDepth={1}
                transitionEnabled={false}
                style={{...this.props.style, display:'flex', alignItems:'center'}}
            >
                {this.props.closeButton}
                {dropDown}
                {links}
                <span style={{flex:1}}/>
                <IconButton
                    onTouchTap={this.toggleEdit.bind(this)}
                    iconClassName={(this.state.edit?'icon-ok':'mdi mdi-pencil')}
                    secondary={this.state.edit}
                    iconStyle={{color:"#9e9e9e"}}
                />
            </Paper>
        );
    }
}

const globalMessages = global.pydio.MessageHash;
QuickLinks = PydioContextConsumer(QuickLinks);
QuickLinks = asGridItem(QuickLinks, globalMessages["ajxp_admin.home.1"], {gridWidth:8, gridHeight:4}, []);
export {QuickLinks as default}