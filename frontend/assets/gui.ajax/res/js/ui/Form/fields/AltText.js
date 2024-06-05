import React from 'react'
import {IconButton} from "material-ui"
import TextField from "./TextField";

export default class AltText extends React.Component {

    render() {
        const {
            attributes,
            altIcon="mdi mdi-toggle-switch",
            altIconText = "mdi mdi-textbox",
            altTip = "Switch to text version",
            onAltTextSwitch,
            variantShowLegend
        } = this.props;

        let comp;
        const {alternativeText} = attributes;
        if(alternativeText) {
            comp = <TextField {...this.props}/>;
        } else {
            comp = this.props.children;
        }
        if(variantShowLegend) {
            // Toggle inside the tooltip, do not show button
            return comp
        }
        return (
            <div style={{display:'flex'}}>
                <div style={{flex: 1}}>{comp}</div>
                <div>
                    <IconButton
                        iconClassName={alternativeText?altIcon:altIconText}
                        title={altTip}
                        onClick={() => onAltTextSwitch(attributes["name"], !alternativeText)}
                        iconStyle={{opacity: .3, fontSize: 20}}
                        style={{padding:'14px 8px', width:42, height: 42}}
                    /></div>
            </div>
        );
    }

}