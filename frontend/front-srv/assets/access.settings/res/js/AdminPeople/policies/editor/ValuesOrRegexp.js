import React from 'react'
import {IconMenu, MenuItem, IconButton, Divider, TextField, Paper} from 'material-ui'

class ValuesOrRegexp extends React.Component{


    constructor(props){
        super(props);
        this.state = {
            showTextField: false,
            textFieldValue: ''
        };
    }

    onItemTouchTap(event, value) {
        const {onValueSelected, freeStringDefaultPrefix} = this.props;
        if (value === -1 || value.startsWith("preset-free-string:")) {
            let prefix = freeStringDefaultPrefix?freeStringDefaultPrefix:'';
            if (value !== -1) {
                prefix = value.replace("preset-free-string:", "");
            }
            this.setState({
                showTextField: true,
                textFieldValue: prefix
            }, () => {
                this.refs.textField.focus();
            });
            return;
        }
        onValueSelected(value);
    }

    onTextFieldSubmitted() {
        const value = this.refs.textField.getValue();
        this.props.onValueSelected(value);
        this.setState({showTextField: false, textFieldValue:''});
    }

    cancelTextField(){
        this.setState({showTextField: false, textFieldValue:''});
    }

    render(){

        const {presetValues, allowAll, allowFreeString, presetFreeStrings} = this.props;
        let items = [];
        if (presetValues) {
            items = presetValues.map((v) => {
                return <MenuItem value={v} primaryText={v}/>
            })
        }
        if (allowAll) {
            items.push(<MenuItem value={"<.+>"} primaryText={"Any values (*)"}/>)
        }

        if (allowFreeString) {
            if(items.length){
                items.push(<Divider/>)
            }
            if(presetFreeStrings) {
                Object.keys(presetFreeStrings).map((k) => {
                    items.push(<MenuItem value={"preset-free-string:" + k} primaryText={presetFreeStrings[k] + "..."}/>)
                });
            } else {
                items.push(<MenuItem value={-1} primaryText={"Enter Free Value..."}/>)
            }
        }

        const editBoxStyle = {
            display:'flex',
            position: 'absolute',
            right: 16,
            zIndex: 100,
            alignItems: 'center',
            backgroundColor: '#f4f4f4',
            paddingLeft: 10,
            borderRadius: 2
        };

        if (this.state.showTextField){
            return (
                <div>
                    <Paper zDepth={2} style={editBoxStyle}>
                        <TextField style={{width: 200}} ref="textField" hintText={"Enter free value..."} defaultValue={this.state.textFieldValue}/>
                        <IconButton iconClassName={"mdi mdi-check"} tooltip={"Add"} onTouchTap={this.onTextFieldSubmitted.bind(this)}/>
                        <IconButton iconClassName={"mdi mdi-cancel"} tooltip={"Cancel"} onTouchTap={this.cancelTextField.bind(this)}/>
                    </Paper>
                    <div style={{height:48}}></div>
                </div>
            );
        } else {
            return (
                <IconMenu
                    iconButtonElement={<IconButton iconClassName={"mdi mdi-plus"} tooltip={"Add value..."}/>}
                    onChange={this.onItemTouchTap.bind(this)}
                >
                    {items}
                </IconMenu>
            );
        }

    }

}

export {ValuesOrRegexp as default}