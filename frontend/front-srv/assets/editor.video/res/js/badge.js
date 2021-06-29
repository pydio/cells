import {Component} from 'react'
import ResourcesManager from 'pydio/http/resources-manager'

class VideoBadge extends Component{

    constructor(props, context){
        super(props, context);
        const {node, pydio} = props;
        this.state = {hasImagePreview : false};
        if(node.getMetadata().get('ImagePreview') && pydio.Registry.findEditorById('editor.diaporama')){
            ResourcesManager.loadClassesAndApply(['PydioDiaporama'], () => {
                this.setState({hasImagePreview: true});
            })
        }

    }

    render(){

        const {hasImagePreview} = this.state;
        if(hasImagePreview) {
            return <PydioDiaporama.Badge {...this.props}/>
        } else {
            return <div className="mimefont mdi-file-video" style={this.props.mimeFontStyle}/>;
        }

    }

}

export {VideoBadge as default}