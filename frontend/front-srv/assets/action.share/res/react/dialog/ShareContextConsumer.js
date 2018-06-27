const React = require('react')

export default function(PydioComponent){

    class ShareContextConsumer extends React.Component{

        render(){
            const {messages, getMessage, isReadonly} = this.context;
            const contextProps = {messages, getMessage, isReadonly};
            return <PydioComponent {...this.props} {...contextProps}/>
        }

    }

    ShareContextConsumer.contextTypes = {
        messages:React.PropTypes.object,
        getMessage:React.PropTypes.func,
        isReadonly:React.PropTypes.func
    };

    return ShareContextConsumer;

}