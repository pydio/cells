import {TextInput as MTextInput, Textarea, JsonInput} from '@mantine/core'

export const TextInput = ({fieldname, label, readonly, value, meta, onValueChange, errorText, supportTemplates, additionalProps}) => {
    const {type} = meta;
    const props = {
        label,
        value,
        disabled: readonly,
        error: errorText,
        onChange:(e) => onValueChange(fieldname, e.target.value),
        onKeyPress: (event) => {
            if(event.key === 'Enter'){
                onValueChange(fieldname, value, true);
            }
        }
    }
    if(type === 'json') {
        return <JsonInput {...props} minRows={3}/>
    } else if(type === 'textarea'){
        return <Textarea {...props} minRows={3}/>
    } else {
        return <MTextInput {...props}/>
    }
}