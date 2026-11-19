import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import Modal from '../../../shared/components/Modal';
import AccentButton from './AccentButton';
import AdminDropdown from './AdminDropdown';
import type {
  StoreRequestCategory,
  StoreRequestPriority,
  Storefront,
} from '../settings/categories/types';

type NewRequestFormProps = {
  isOpen: boolean;
  storefront: Storefront;
  storeLabel: string;
  onClose: () => void;
  onSubmit: (data: {
    storefront: Storefront;
    title: string;
    category: StoreRequestCategory;
    description: string;
    priority: StoreRequestPriority;
  }) => boolean;
};

const INPUT_STYLE = {
  width: '100%',
  paddingInline: 'var(--admin-space-sm)',
  paddingBlock: 'var(--admin-space-xs)',
  borderRadius: 'var(--ds-radius-lg)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--admin-border-strong)',
  backgroundColor: 'var(--admin-surface-subtle)',
  color: 'var(--admin-text-primary)',
  fontSize: 'var(--admin-size-body)',
  outline: 'none',
} as const;

const LABEL_STYLE = {
  fontSize: 'var(--admin-size-micro)',
  fontWeight: 'var(--admin-weight-medium)',
  color: 'var(--admin-text-secondary)',
  display: 'block',
  marginBottom: 'var(--admin-space-xxs)',
} as const;

const CATEGORY_OPTIONS: { value: StoreRequestCategory; label: string }[] = [
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'content', label: 'Content change' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS: { value: StoreRequestPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function NewRequestForm({
  isOpen,
  storefront,
  storeLabel,
  onClose,
  onSubmit,
}: NewRequestFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<StoreRequestCategory>('other');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<StoreRequestPriority>('medium');

  if (!isOpen) return null;

  const reset = () => {
    setTitle('');
    setCategory('other');
    setDescription('');
    setPriority('medium');
  };

  const handleSubmit = () => {
    const success = onSubmit({
      storefront,
      title,
      category,
      description,
      priority,
    });
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <Modal isOpen onClose={onClose} maxWidth="max-w-lg">
      <div style={{ padding: 'var(--admin-space-lg)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--admin-space-md)' }}>
          <div className="flex flex-col" style={{ gap: 'var(--admin-space-xxs)' }}>
            <h3 style={{ fontSize: 'var(--admin-size-heading-3)', fontWeight: 'var(--admin-weight-semibold)', color: 'var(--admin-text-primary)', margin: 0 }}>
              New request
            </h3>
            <p style={{ fontSize: 'var(--admin-size-micro)', color: 'var(--admin-text-tertiary)', margin: 0 }}>
              For {storeLabel} — the technical team will review and respond.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-text-tertiary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FiX size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 'var(--admin-space-md)' }}>
          <label style={LABEL_STYLE}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary of your request"
            maxLength={100}
            style={INPUT_STYLE}
          />
        </div>

        {/* Category + Priority row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--admin-space-sm)', marginBottom: 'var(--admin-space-md)' }}>
          <div>
            <label style={LABEL_STYLE}>Category</label>
            <AdminDropdown
              value={category}
              onChange={(v) => setCategory(v as StoreRequestCategory)}
              options={CATEGORY_OPTIONS}
              align="left"
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>Priority</label>
            <AdminDropdown
              value={priority}
              onChange={(v) => setPriority(v as StoreRequestPriority)}
              options={PRIORITY_OPTIONS}
              align="left"
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 'var(--admin-space-md)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--admin-space-xxs)' }}>
            <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>Description</label>
            <span style={{ fontSize: 'var(--admin-size-micro)', color: description.length > 450 ? 'var(--admin-status-amber)' : 'var(--admin-text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
              {description.length}/500
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Describe what you need in as much detail as possible."
            style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--admin-space-xs)' }}>
          <AccentButton variant="neutral" shape="pill" onClick={onClose} ariaLabel="Cancel">
            Cancel
          </AccentButton>
          <AccentButton variant="dark" shape="pill" onClick={handleSubmit} ariaLabel="Submit request">
            Submit request
          </AccentButton>
        </div>
      </div>
    </Modal>
  );
}
