(function(global){

    class Loader{

        static loadInfoPanel(container, node){
            let mainCont = container.querySelectorAll("#ajxp_shared_info_panel .infoPanelTable")[0];
            mainCont.destroy = function(){
                React.unmountComponentAtNode(mainCont);
            };
            mainCont.className += (mainCont.className ? ' ' : '') + 'infopanel-destroyable-pane';
            React.render(
                React.createElement(InfoPanel, {pydio:global.pydio, node:node}),
                mainCont
            );
        }
    }

    const ReactInfoPanel = React.createClass({

        render: function(){

            let actions = [
                <MaterialUI.FlatButton
                    key="edit-share"
                    label={this.props.pydio.MessageHash['share_center.125']}
                    primary={true}
                    onTouchTap={()=>{global.pydio.getController().fireAction("share-edit-shared");}}
                />
            ];

            return (
                <PydioWorkspaces.InfoPanelCard title={this.props.pydio.MessageHash['share_center.50']} actions={actions} icon="share-variant" iconColor="#009688" iconStyle={{fontSize:13, display:'inline-block', paddingTop:3}}>
                    <InfoPanel {...this.props}/>
                </PydioWorkspaces.InfoPanelCard>
            );

        }

    });

    global.ShareInfoPanel = {};
    global.ShareInfoPanel.loader = Loader.loadInfoPanel;
    global.ShareInfoPanel.InfoPanel = ReactInfoPanel;


})(window);
