const PropTypes = require('prop-types');
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
        messages:PropTypes.object,
        getMessage:PropTypes.func,
        isReadonly:PropTypes.func
    };

    return ShareContextConsumer;

}