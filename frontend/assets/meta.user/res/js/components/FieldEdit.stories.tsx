import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FieldEdit } from './FieldEdit';
import type { NamespaceMeta } from './MetaSpec';

// Stub the MetaClient tag loader used by tag_cloud/auto_complete fields.
// Storybook Vite loads real modules, so we monkey-patch on first import.
import MetaClient from '../MetaClient';
(MetaClient as any).getInstance = () => ({
    listTags: async () =>
        ['document', 'image', 'report', 'archive', 'spreadsheet'],
});

/**
 * FieldEdit renders the correct input for a metadata namespace based on its
 * `type` (text, integer, date, boolean, choice, tag_cloud, ...). It receives a
 * context object with `state.formState` (a Map) and `actions` to mutate it.
 */
const meta: Meta<typeof FieldEdit> = {
    title: 'meta.user/components/FieldEdit',
    component: FieldEdit,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'Polymorphic metadata field editor. Story wires a stateful context so the input is fully interactive.',
            },
        },
    },
};
export default meta;

type Story = StoryObj<typeof FieldEdit>;

type Args = {
    name: string;
    meta: NamespaceMeta;
    initialValue?: any;
    errors?: Record<string, string>;
    isEditing?: boolean;
    isToggable?: boolean;
    shouldHideLabel?: boolean;
};

const Harness: React.FC<Args> = ({
    name,
    meta,
    initialValue = '',
    errors = {},
    isEditing = true,
    isToggable = false,
    shouldHideLabel = false,
}) => {
    const [formState, setFormState] = useState<Map<string, any>>(
        () => new Map([[name, initialValue]]),
    );
    const [shouldSave, setShouldSave] = useState(false);

    const context = useMemo(
        () => ({
            state: { formState, saving: false, shouldSave, errors },
            actions: {
                // Must create a new Map so React detects the change.
                // FieldEdit mutates in place (state.formState.set(name, v)),
                // so we always copy to get a fresh reference.
                setFormState: (next) => setFormState(new Map(next)),
                setShouldSave,
            },
        }),
        [formState, shouldSave, errors],
    );

    return (
        <div style={{ maxWidth: 480 }}>
            <FieldEdit
                context={context}
                name={name}
                meta={meta}
                value={formState.get(name)}
                isEditing={isEditing}
                isToggable={isToggable}
                shouldHideLabel={shouldHideLabel}
            />
            <pre style={{ marginTop: 16, fontSize: 12, opacity: 0.6 }}>
                value: {JSON.stringify(formState.get(name))}
                {'\n'}shouldSave: {String(shouldSave)}
            </pre>
        </div>
    );
};

const ns = (over: Partial<NamespaceMeta> & { type: string }): NamespaceMeta =>
    ({
        namespace: 'usermeta-demo',
        label: 'Demo field',
        type: over.type,
        readonly: false,
        required: false,
        indexable: true,
        description: '',
        data: {},
        ...over,
    }) as unknown as NamespaceMeta;

export const Text: Story = {
    render: () => (
        <Harness
            name="title"
            meta={ns({ type: 'string', label: 'Title', description: 'Short title for the file' })}
            initialValue="Quarterly report"
        />
    ),
};

export const Integer: Story = {
    render: () => (
        <Harness
            name="amount"
            meta={ns({ type: 'integer', label: 'Amount', data: { format: 'currency' } })}
            initialValue={1200}
        />
    ),
};

export const Boolean: Story = {
    render: () => (
        <Harness
            name="confidential"
            meta={ns({ type: 'boolean', label: 'Confidential' })}
            initialValue={false}
        />
    ),
};

export const Choice: Story = {
    render: () => (
        <Harness
            name="status"
            meta={ns({
                type: 'choice',
                label: 'Status',
                data: {
                    items: [
                        { key: 'draft', value: 'Draft' },
                        { key: 'review', value: 'In review' },
                        { key: 'done', value: 'Done' },
                    ],
                },
            })}
            initialValue="review"
        />
    ),
};

export const StarsRate: Story = {
    render: () => (
        <Harness
            name="rating"
            meta={ns({ type: 'stars_rate', label: 'Rating' })}
            initialValue={3}
        />
    ),
};

export const Date_: Story = {
    name: 'Date',
    render: () => (
        <Harness
            name="dueDate"
            meta={ns({ type: 'date', label: 'Due date', data: { format: 'date' } })}
        />
    ),
};

export const TagCloud: Story = {
    render: () => (
        <Harness
            name="tags"
            meta={ns({ type: 'tag_cloud', label: 'Tags' })}
            initialValue=""
        />
    ),
};

export const WithError: Story = {
    render: () => (
        <Harness
            name="title"
            meta={ns({ type: 'string', label: 'Title', required: true })}
            initialValue=""
            errors={{ title: 'Title is required' }}
        />
    ),
};

export const Readonly: Story = {
    render: () => (
        <Harness
            name="title"
            meta={ns({ type: 'string', label: 'Title', readonly: true })}
            initialValue="Locked value"
            isEditing={false}
            isToggable
        />
    ),
};
