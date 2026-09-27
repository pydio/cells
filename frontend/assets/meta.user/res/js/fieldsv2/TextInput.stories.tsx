import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
    title: 'meta.user/fieldsv2/TextInput',
    component: TextInput,
    tags: ['autodocs'],
    args: {
        name: 'sample',
        label: 'Sample',
        placeholder: 'Type something',
    },
};
export default meta;

type Story = StoryObj<typeof TextInput>;

const Controlled = (args: any) => {
    const [v, setV] = useState<string>(args.value ?? '');
    return <TextInput {...args} value={v} onChange={setV} onCommitChange={() => {}} />;
};

export const Default: Story = { render: (args) => <Controlled {...args} /> };

export const Textarea: Story = {
    args: { subType: 'textarea', description: 'Multi-line input' },
    render: (args) => <Controlled {...args} />,
};

export const Json: Story = {
    args: { subType: 'json', description: 'JSON input' },
    render: (args) => <Controlled {...args} value={'{\n  "hello": "world"\n}'} />,
};

export const WithError: Story = {
    args: { errorText: 'This field is required', required: true },
    render: (args) => <Controlled {...args} />,
};

export const Disabled: Story = {
    args: { disabled: true, value: 'Read only' },
    render: (args) => <Controlled {...args} />,
};
