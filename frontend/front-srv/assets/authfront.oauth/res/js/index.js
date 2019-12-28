import LoginConnectorsDialog from './LoginConnectorsDialog'

class Callbacks{
    static login() {
        PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
            if (jwt == "") {
                pydio.UI.openComponentInModal('AuthfrontOAuth', 'LoginConnectorsDialog', {blur: true});
            } else {
                pydio.Registry.load()
            }
        })
    }
}

export {LoginConnectorsDialog, Callbacks}