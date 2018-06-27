import React from 'react'
import {TextField, IconButton, RaisedButton} from 'material-ui'

class DNs extends  React.Component {

    constructor(props){
        super(props);
    }

    addDn(){
        const {dns, onChange} = this.props;
        const newDns = [...dns, ''];
        onChange(newDns);
    }

    editDn(index, value){
        const {dns, onChange} = this.props;
        const newVals = [
            ...dns.slice(0, index > 0 ? index : 0),
            value,
            ...dns.slice(index + 1)
        ];
        onChange(newVals);
    }

    removeDn(index){
        const {dns, onChange} = this.props;
        onChange([
            ...dns.slice(0, index),
            ...dns.slice(index + 1)
        ]);
    }

    render(){

        const {dns, pydio} = this.props;

        return (
            <div>
                {dns.map((dn, k) => {
                    return (
                        <div style={{display:'flex', alignItems:k===0 ? 'baseline': 'center'}}>
                            <div style={{flex: 1}}><TextField fullWidth={1} floatingLabelText={k === 0 ? "DN":undefined} hintText={k > 0 ? "DN" : undefined} value={dn} onChange={(e, val) => this.editDn(k, val)}/></div>
                            <IconButton iconClassName={"mdi mdi-delete"} onTouchTap={() => {this.removeDn(k)}} disabled={k === 0}/>
                        </div>
                    );
                })}
               <div style={{textAlign:'left'}}>
                   <RaisedButton label={pydio.MessageHash["ldap.11"]} onTouchTap={() => {this.addDn()}} disabled={!dns.length || !dns[dns.length-1]}/>
               </div>
            </div>
        );


    }

}

export {DNs as default}