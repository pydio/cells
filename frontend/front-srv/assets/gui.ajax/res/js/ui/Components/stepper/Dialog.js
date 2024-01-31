/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import React from 'react'
import Pydio from 'pydio'
import {Dialog, IconButton} from 'material-ui'
const {ModernTextField} = Pydio.requireLib('hoc');

class StepperDialog extends React.Component {

    componentDidMount() {
        const {onDismiss} = this.props;
        this._listener = e => {
            if(e.key === 'Escape') {
                onDismiss();
            }
        }
        document.addEventListener("keyup", this._listener);
    }

    componentWillUnmount() {
        document.removeEventListener("keyup", this._listener)
    }

    componentDidUpdate(prevProps){
        if (prevProps.random !== this.props.random && this.refs['dialog']) {
            setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 0);
        }
    }

    render(){
        const {title, actions, open, onDismiss, onFilter, filterHint, customFilter, children, dialogProps} = this.props;

        let tt = title;
        if(onDismiss || onFilter || customFilter){
            tt = (
                <div style={{position:'relative', display:'flex', alignItems:'center'}}>
                        <div style={{flex: 1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{title}</div>
                    {onFilter &&
                        <div style={{flex: 1, height: 34, marginTop: -10, marginRight: onDismiss && !customFilter?50:10, marginLeft: 10}}>
                            <ModernTextField variant={"compact"} hintText={filterHint || 'Find in list'} onChange={(e,v)=>{onFilter(v)}} fullWidth={true} focusOnMount={true}/>
                        </div>
                    }
                    {customFilter &&
                        <div style={{marginRight: 50}}>{customFilter}</div>
                    }
                    {onDismiss &&
                        <div style={{position:'absolute', top: 11, right: 20}}><IconButton iconClassName={"mdi mdi-close"} onClick={onDismiss}/></div>
                    }
                </div>
            );
        }

        return (
            <Dialog
                ref={"dialog"}
                title={tt}
                actions={actions}
                modal={dialogProps.modal}
                open={open}
                autoDetectWindowHeight={true}
                autoScrollBodyContent={true}
                contentClassName={"stepper-dialog"}
                bodyStyle={{
                    backgroundColor:'rgb(236, 239, 241)',
                    borderRadius: '0 0 6px 6px',
                    ...dialogProps.bodyStyle
                }}
                contentStyle={{
                    width: '90%',
                    maxWidth:'none',
                    borderRadius: 6,
                    ...dialogProps.contentStyle
                }}
                titleStyle={{
                    borderBottom: 'none',
                    backgroundColor:'rgb(246, 247, 248)',
                    borderRadius: '6px 6px 0 0',
                    ...dialogProps.titleStyle
                }}
            >
                {children}
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:`.stepper-dialog > div{border-radius: 6px !important;}`}}/>
            </Dialog>
        );
    }

}

export default StepperDialog;