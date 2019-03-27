import {Component} from 'react'
import ResourcesManager from 'pydio/http/resources-manager'

class PdfBadge extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {hasImagick : false};
        if(props.pydio.Registry.findEditorById('editor.imagick')){
            ResourcesManager.loadClassesAndApply(['PydioImagick'], () => {
                this.setState({hasImagick: true});
            })
        }
    }

    render(){

        if(!this.state.hasImagick){
            return <div className="mimefont mdi-file-pdf" style={this.props.mimeFontStyle}/>;
        }else{
            return <PydioImagick.Badge {...this.props}/>
        }

    }

}

export {PdfBadge as default}