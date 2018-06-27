(function(global){

    let pydio = global.pydio;

    class Callbacks{

        static share(){
            pydio.UI.openComponentInModal('ShareDialog', 'CompositeDialog', {pydio:pydio, selection:pydio.getUserSelection(), create:true});
        }
        
        static editShare(){
            const node = pydio.getUserSelection().getUniqueNode();
            pydio.UI.openComponentInModal('ShareDialog', 'CompositeDialog', {pydio:pydio, selection:pydio.getUserSelection()});
        }

        static loadList(){
            if(window.actionManager){
                window.actionManager.getDataModel().requireContextChange(window.actionManager.getDataModel().getRootNode(), true);
            }
        }
        
        static clearExpired(){
            var conn = new Connexion();
            conn.addParameter("get_action", "sharelist-clearExpired");
            var dm = window.actionManager.getDataModel();
            conn.onComplete = function(transport){
                PydioApi.getClient().parseXmlMessage(transport.responseXML);
                if(window.actionManager){
                    dm.requireContextChange(dm.getRootNode(), true);
                }
            };
            conn.sendAsync();
        }
        
        static editFromList(){
            var dataModel;
            if(window.actionArguments && window.actionArguments.length){
                dataModel = window.actionArguments[0];
            }else if(window.actionManager){
                dataModel = window.actionManager.getDataModel();
            }
            pydio.UI.openComponentInModal('ShareDialog', 'MainPanel', {pydio:pydio, readonly:true, selection:dataModel});
        }

        static openUserShareView(){

            pydio.UI.openComponentInModal('ShareDialog', 'ShareViewModal', {
                pydio:pydio,
                currentUser:true,
                filters:{
                    parent_repository_id:"250",
                    share_type:"share_center.238"
                }
            });

        }

    }

    class Listeners{}

    global.ShareActions = {
        Callbacks:Callbacks,
        Listeners: Listeners
    };

})(window)