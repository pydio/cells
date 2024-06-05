import Pydio from 'pydio'
import PydioApi from "pydio/http/api";
import uuid4 from "uuid4";
import {UserMetaServiceApi, IdmUpdateUserMetaNamespaceRequest, UpdateUserMetaNamespaceRequestUserMetaNsOp} from 'cells-sdk'

function T(id) {
    const m = Pydio.getInstance().MessageHash;
    return m['migration.action.' + id] || m['migration.' + id] || m[id] || id;
}

export function startJob(state, onLocalUpdate) {
    const {features, cellAdmin} = state;
    const allActions = [];
    const sessionUuid = uuid4();
    Object.keys(features).forEach(k => {
        const feature = features[k];
        if (feature.value && typeof feature.action === "function") {
            feature.action(state, onLocalUpdate).map(a => {
                a.params = {...a.params, cellAdmin, sessionUuid};
                allActions.push(a);
            });
        }
    });
    if(allActions.length){
        PydioApi.getRestClient().userJob("import-p8", allActions).then((res) => {
            console.log(res);
        }).catch((err) => {
            const msg = err.Detail || err.message || err;
            Pydio.getInstance().UI.displayMessage('ERROR', msg);
        });
    }
}

export function getConfigsAction(state, onLocalUpdate) {
    const {url, user, pwd, skipVerify} = state;

    return [{
        name: "actions.etl.configs",
        params:{
            left:"pydio8",
            right:"cells-local",
            url,
            user,
            password: pwd,
            skipVerify:skipVerify?"true":"false"
        }
    }]
}

export function getUsersAction(state, onLocalUpdate) {
    const {url, user, pwd, skipVerify, cellAdmin} = state;

    return [{
        name: "actions.etl.users",
        params:{
            left:"pydio8",
            right:"cells-local",
            splitUsersRoles:"true",
            cellAdmin,
            url: url,
            user: user,
            password: pwd,
            skipVerify:skipVerify?"true":"false"
        }
    }]
}

export function getAclsAction(state, onLocalUpdate){
    const {url, user, pwd, skipVerify, cellAdmin, workspaceMapping} = state;

    return [{
        name: "actions.etl.p8-workspaces",
        params:{
            type:"pydio8",
            url: url,
            user: user,
            password: pwd,
            skipVerify:skipVerify?"true":"false",
            mapping: JSON.stringify(workspaceMapping),
            cellAdmin,
        }
    }];
}

export function getWorkspacesAction(state, onLocalUpdate) {
    const {workspaceCreate, localStatus} = state;
    Object.keys(workspaceCreate).forEach(k => {
        workspaceCreate[k].save().then(()=>{
            onLocalUpdate(T('createws.success').replace('%s', workspaceCreate[k].getModel().Label));
        }).catch(e => {
            onLocalUpdate(T('createws.fail').replace('%1', workspaceCreate[k].getModel().Label).replace('%2', e.message));
        });
    });
    return [];
}

export function getWorkspacesSummary(state){
    const {workspaceMapping, workspaceCreate={}} = state;
    return (
        <div>
            {T('createws.summary')}
            {Object.keys(workspaceMapping).length > 0 &&
            <table style={{width:400, marginTop: 6}}>
                <tr>
                    <td style={{backgroundColor:'#f5f5f5', padding: '2px 4px'}}>{T('createws.head.pydio')}</td>
                    <td style={{backgroundColor:'#f5f5f5', padding: '2px 4px'}}>{T('createws.head.cells')}</td>
                    <td style={{backgroundColor:'#f5f5f5', padding: '2px 4px'}}>{T('createws.head.status')}</td>
                </tr>
                {Object.keys(workspaceMapping).map(k => {
                    return (
                        <tr>
                            <td style={{padding:'2px 4px'}}>{k}</td>
                            <td style={{padding:'2px 4px'}}>{workspaceMapping[k]}</td>
                            <td style={{padding:'2px 4px'}}>{workspaceCreate[k]?T('createws.notexists'):T('createws.exists')}</td>
                        </tr>);
                })}
            </table>
            }
        </div>
    )
}

export function getSharesAction(state, onLocalUpdate) {
    const {cellAdmin, url, user, pwd, skipVerify, workspaceMapping, sharesFeatures} = state;

    return [{
        name: "actions.etl.shares",
        params:{
            left:"pydio8",
            right:"cells-local",
            mapping:JSON.stringify(workspaceMapping),
            url,
            user,
            cellAdmin,
            skipVerify:skipVerify?"true":"false",
            password: pwd,
            ...sharesFeatures
        }
    }];
}

export function getSharesSummary(state){
    const {sharesFeatures} = state;
    return (
        <div>
            {sharesFeatures && sharesFeatures.shareType && <div>{sharesFeatures.shareType === 'LINK' ? T('share.linksonly') : T('share.cellsonly')}.</div>}
            {(!sharesFeatures || !sharesFeatures.shareType) && <div>{T('share.all')}</div>}
            {sharesFeatures && sharesFeatures.ownerId && <div>{T('share.user').replace('%s', sharesFeatures.ownerId)}</div>}
        </div>
    );
}

export function getMetadataAction(state, onLocalUpdate) {

    const {url, user, pwd, skipVerify, workspaceMapping, metadataFeatures, metadataMapping, metadataCreate} = state;

    let global = metadataFeatures.indexOf('watches') > -1 || metadataFeatures.indexOf('bookmarks') > -1;
    let files = metadataFeatures.indexOf('filesMeta') > -1 ;
    let filesAction, globalAction;
    let actions = [];
    if(global){
        globalAction = {
            name:"actions.etl.p8-global-meta",
            params:{
                url, user, password: pwd,
                skipVerify:skipVerify?"true":"false",
                mapping:JSON.stringify(workspaceMapping)
            }
        };
        actions.push(globalAction);
    }
    if(files){
        filesAction = {
            name:"actions.etl.p8-legacy-meta",
            params:{
                metaMapping: JSON.stringify(metadataMapping),
            }
        };
        actions.push(filesAction);
    }
    if(metadataCreate.length){
        const api = new UserMetaServiceApi(PydioApi.getRestClient());
        let request = new IdmUpdateUserMetaNamespaceRequest();
        request.Operation = UpdateUserMetaNamespaceRequestUserMetaNsOp.constructFromObject('PUT');
        request.Namespaces = metadataCreate;
        api.updateUserMetaNamespace(request).then((res)=> {
            onLocalUpdate(T('meta.success'));
        }).catch((e)=> {
            onLocalUpdate(T('meta.fail').replace('%s', e.message));
        })
    }

    return actions;

}

export function getMedataSummary(state){
    const {metadataFeatures, metadataMapping} = state;
    return (
        <div>
            {metadataFeatures && <div>{T('meta.summary')} {metadataFeatures.join(', ')}</div>}
            {metadataMapping &&
            <div>{T('meta.files')}
                <table style={{width: 400, marginTop: 6}}>
                    <tr><td style={{backgroundColor:'#f5f5f5', padding: '2px 4px'}}>{T('createws.head.pydio')}</td><td style={{backgroundColor:'#f5f5f5', padding: '2px 4px'}}>{T('createws.head.cells')}</td></tr>
                    {Object.keys(metadataMapping).map(k => {
                        return <tr><td style={{padding:'2px 4px'}}>{k}</td><td style={{padding:'2px 4px'}}>{metadataMapping[k]}</td></tr>
                    })}
                </table>
            </div>
            }
        </div>
    );
}
