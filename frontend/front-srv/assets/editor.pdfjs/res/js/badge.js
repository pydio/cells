import {Component} from 'react'

class PdfBadge extends Component{

    constructor(props, context){
        super(props, context);
    }

    render(){

        return <div className="mimefont mdi-file-pdf" style={this.props.mimeFontStyle}/>;

    }

}

export {PdfBadge as default}