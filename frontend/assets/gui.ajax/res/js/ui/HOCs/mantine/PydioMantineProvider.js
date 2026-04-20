import {MantineProvider, createTheme, Input, TextInput, NumberInput, JsonInput, Textarea, Select, TagsInput} from '@mantine/core'
import {DateTimePicker} from '@mantine/dates'
import {muiThemeable} from "material-ui/styles";


const extension = {
    defaultProps: {
        size: 'sm',
        radius: 'md',
    },
}
const manTheme = createTheme({
    components: {
        Input: Input.extend(extension),
        TextInput: TextInput.extend(extension),
        NumberInput: NumberInput.extend(extension),
        Textarea: Textarea.extend(extension),
        JsonInput: JsonInput.extend(extension),
        Select: Select.extend(extension),
        TagsInput: TagsInput.extend(extension),
        DateTimePicker: DateTimePicker.extend(extension),
        InputWrapper: Input.Wrapper.extend({
            styles: {
                root: {marginBottom: 10},
                label: {marginBottom: 4},
            },
        }),
    },
});

export const PydioMantineProvider = muiThemeable()(({presetTheme, muiTheme, children}) => {
    const theme = presetTheme || muiTheme;
    return <MantineProvider forceColorScheme={theme.darkMode?'dark':'light'} theme={manTheme}>{children}</MantineProvider>
});