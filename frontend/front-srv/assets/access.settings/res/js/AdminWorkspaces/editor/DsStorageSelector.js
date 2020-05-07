import React from 'react'
import Pydio from 'pydio'
import DOMUtils from 'pydio/util/dom'
import {Paper} from 'material-ui'

class DsStorageType extends React.Component{
    render(){
        const {onSelect, selected, value, primaryText, image} = this.props;
        let styles = {
            cont: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '10px 10px 0 10px',
                backgroundColor:'transparent',
                borderBottom: '2px solid transparent',
                transition:DOMUtils.getBeziersTransition(),
            },
            image: {
                width: 30,
                height: 30,
                opacity: .3,
                transition:DOMUtils.getBeziersTransition(),
            },
            label:{
                margin: 5,
                marginTop: 8,
                /*textTransform: 'uppercase',*/
                fontSize: 11,
                fontWeight: 500,
                color: 'rgba(0,0,0,.3)',
                textAlign:'center',
                transition:DOMUtils.getBeziersTransition(),
            }
        };
        if(selected){
            styles.cont.borderBottom = '2px solid #0e4d6d';
            //styles.cont.backgroundColor = '#fff';
            styles.image.opacity = 1;
            styles.label.color = '#0e4d6d'
        }

        return (
            <div zDepth={0} style={styles.cont} onClick={(e) => {onSelect(value)}} rounded={false}>
                {image &&
                    <img style={styles.image} src={"plug/access.settings/res/images/" + image}/>
                }
                <div style={styles.label}>{primaryText}</div>
            </div>
        )
    }
}

class DsStorageSelector extends React.Component{

    constructor(props){
        super(props);
    }

    onChange(newValue){
        const {values, onChange} = this.props;
        const i = Object.keys(values).indexOf(newValue);
        onChange(null, i, newValue);
    }


    render(){
        const {values, value, disabled} = this.props;
        const style = {
            display:'flex',
            padding: '0 1px',
            backgroundColor:'#ECEFF1'
        };
        return (
            <div style={style}>
                {Object.keys(values).map(k => {
                    return (
                        <DsStorageType
                            value={k}
                            selected={k === value}
                            onSelect={disabled ? () => {} : this.onChange.bind(this)}
                            primaryText={values[k].primaryText}
                            image={values[k].image}
                        />
                    )
                })}
            </div>
        )
    }

}

export {DsStorageSelector as default}