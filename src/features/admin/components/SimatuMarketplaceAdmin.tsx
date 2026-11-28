import React, { useState } from 'react';
import Modal from '../../../shared/components/Modal';
import type { MoodboardItem } from '../../../systems/homepage/discover/KineticMoodboard';
import { DISCOVERY_MARKETS } from '../../../systems/homepage/discover/discovery-taxonomy';
import AdminMoodboardLayoutPreview from './AdminMoodboardLayoutPreview';
import './AdminMoodboardLayoutPreview.css';
import { getSubcategories, type DiscoverySubcategory } from '../../../systems/homepage/discover/discovery-taxonomy';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../../systems/homepage/design-system/index.css';
import './SimatuMarketplaceAdminModal.css';

type Props = { onReturn: () => void; };

type TextEditTriggerProps = { value: string; onEdit: () => void; };
function TextEditTrigger({ value, onEdit }: TextEditTriggerProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '100%' }}>
      <span>{value}</span>
      <button type="button" onClick={onEdit} aria-label="Edit this text" title="Edit this text" style={{ display: 'inline-grid', placeItems: 'center', flex: '0 0 30px', width: 30, height: 30, border: '1px solid rgba(255,255,255,.28)', borderRadius: '50%', background: 'rgba(15,15,15,.55)', color: '#fff', cursor: 'pointer', fontSize: 13 }}>✎</button>
    </span>
  );
}
type CategoryDraft = MoodboardItem;
type SubcategoryDraft = DiscoverySubcategory;

const floatingButtonStyle: React.CSSProperties = {
  position: 'fixed', zIndex: 30, top: 18, left: 18, minHeight: 46, padding: '0 16px',
  border: '1px solid rgba(255,255,255,.35)', borderRadius: 999, background: 'rgba(17,17,17,.72)',
  color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(12px)',
};
const overlayButton: React.CSSProperties = {
  position: 'absolute', zIndex: 3, top: 12, right: 12, width: 38, height: 38,
  display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,.5)',
  borderRadius: '50%', background: 'rgba(15,15,15,.75)', color: '#fff', cursor: 'pointer',
  backdropFilter: 'blur(10px)', fontSize: 17,
};
const addCardStyle: React.CSSProperties = {
  display: 'flex', width: '100%', aspectRatio: '4 / 5', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: 12, border: '1px dashed rgba(255,255,255,.55)',
  borderRadius: 8, background: 'rgba(255,255,255,.035)', color: '#fff', cursor: 'pointer',
};

export default function SimatuMarketplaceAdmin({ onReturn }: Props) {
  const [activeMarket, setActiveMarket] = useState<CategoryDraft | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);
  const [subcategoryDrafts, setSubcategoryDrafts] = useState<SubcategoryDraft[]>([]);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [newSubcategoryTitle, setNewSubcategoryTitle] = useState('');
  const [newSubcategoryDescription, setNewSubcategoryDescription] = useState('');
  const [newSubcategoryImage, setNewSubcategoryImage] = useState('');

  const openMarket = (market: MoodboardItem) => {
    setActiveMarket(market);
    setCategoryDraft({ ...market });
    setSubcategoryDrafts(getSubcategories(market.id).map((item) => ({ ...item })));
    setIsAddingSubcategory(false);
  };
  const returnToTiles = () => {
    setActiveMarket(null);
    setCategoryDraft(null);
    setSubcategoryDrafts([]);
    setIsAddingSubcategory(false);
  };
  const beginEdit = (field: string, value: string) => { setEditingField(field); setEditingValue(value); };
  const cancelEdit = () => { setEditingField(null); setEditingValue(''); };
  const saveEdit = () => {
    if (!editingField) return;
    const value = editingValue.trim();
    if (editingField === 'add-subcategory') {
      const title = newSubcategoryTitle.trim();
      if (!title) return;
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
      setSubcategoryDrafts((items) => [...items, { id, title, description: newSubcategoryDescription.trim(), image: newSubcategoryImage.trim(), alt: title, terms: [title.toLowerCase()] }]);
      setNewSubcategoryTitle(''); setNewSubcategoryDescription(''); setNewSubcategoryImage(''); setIsAddingSubcategory(false);
    } else {
      if (!value) return;
      if (editingField === 'category-title') setCategoryDraft((current) => current ? { ...current, category: value } : current);
      else if (editingField === 'category-description') setCategoryDraft((current) => current ? { ...current, title: value } : current);
      else if (editingField === 'category-image') setCategoryDraft((current) => current ? { ...current, image: value } : current);
      else if (editingField.startsWith('subcategory-title-')) {
        const id = editingField.slice('subcategory-title-'.length);
        setSubcategoryDrafts((items) => items.map((item) => item.id === id ? { ...item, title: value } : item));
      } else if (editingField.startsWith('subcategory-description-')) {
        const id = editingField.slice('subcategory-description-'.length);
        setSubcategoryDrafts((items) => items.map((item) => item.id === id ? { ...item, description: value } : item));
      } else if (editingField.startsWith('subcategory-image-')) {
        const id = editingField.slice('subcategory-image-'.length);
        setSubcategoryDrafts((items) => items.map((item) => item.id === id ? { ...item, image: value, alt: item.title } : item));
      }
    }
    cancelEdit();
  };
  const editCategoryImage = () => { if (categoryDraft) beginEdit('category-image', categoryDraft.image); };
  const editSubcategoryImage = (id: string) => { const current = subcategoryDrafts.find((item) => item.id === id); if (current) beginEdit('subcategory-image-' + id, current.image); };
  const addSubcategory = () => { setNewSubcategoryTitle(''); setNewSubcategoryDescription(''); setNewSubcategoryImage(''); setIsAddingSubcategory(true); setEditingField('add-subcategory'); };
  const importDeviceImage = (file: File | undefined, onLoaded: (dataUrl: string) => void) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onLoaded(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
    <div className="admin-marketplace-moodboard" aria-label="Marketplace management" style={{ position: 'fixed', inset: 0, zIndex: 10, overflow: 'hidden', background: '#111', color: '#f4f1ec' }}>
      <button type="button" onClick={activeMarket ? returnToTiles : onReturn} aria-label={activeMarket ? 'Back to Admin Market categories' : 'Return to Admin dashboard'} style={floatingButtonStyle}>{activeMarket ? '← Back' : '← Return'}</button>
      {!activeMarket || !categoryDraft ? (
        <div style={{ position: 'absolute', inset: '64px 0 0', overflow: 'auto', overscrollBehavior: 'contain' }}><AdminMoodboardLayoutPreview items={DISCOVERY_MARKETS} onItemClick={openMarket} /></div>
      ) : (
        <main style={{ minHeight: '100dvh', overflowY: 'auto', background: '#111', color: '#f4f1ec' }}>
          <section style={{ position: 'relative', minHeight: '42vh', display: 'flex', alignItems: 'flex-end', padding: 'clamp(24px,5vw,72px)', overflow: 'hidden' }}>
            <img src={categoryDraft.image} alt={categoryDraft.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: categoryDraft.objectPosition || 'center' }} />
            <button type="button" onClick={editCategoryImage} aria-label="Edit category image" title="Edit category image" style={overlayButton}>▧</button>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#111 0%,rgba(17,17,17,.92) 14%,rgba(17,17,17,.38) 58%,transparent 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
              <h1 style={{ fontSize: 'clamp(40px,8vw,96px)', lineHeight: .95, fontWeight: 500, margin: '18px 0' }}>
                <TextEditTrigger value={categoryDraft.category} onEdit={() => beginEdit('category-title', categoryDraft.category)} />
              </h1>
              <p style={{ fontSize: 'clamp(14px,1.4vw,18px)', lineHeight: 1.65, maxWidth: 680 }}>
                <TextEditTrigger value={categoryDraft.title} onEdit={() => beginEdit('category-description', categoryDraft.title)} />
              </p>
            </div>
          </section>
          <section style={{ padding: 'clamp(24px,5vw,72px)' }}>
            <Swiper modules={[A11y, Keyboard, Navigation, Pagination]} slidesPerView={1.35} slidesPerGroup={1} spaceBetween={14} speed={520} threshold={6} resistanceRatio={0.85} roundLengths watchSlidesProgress breakpoints={{ 480: { slidesPerView: 2.15, spaceBetween: 16 }, 768: { slidesPerView: 3.15, spaceBetween: 20 }, 1100: { slidesPerView: 4.15, spaceBetween: 24 } }} navigation={subcategoryDrafts.length > 2} pagination={subcategoryDrafts.length > 0 ? { clickable: true } : false} keyboard={{ enabled: true, onlyInViewport: true }} grabCursor slideToClickedSlide watchOverflow loop={false} aria-label={categoryDraft.category + ' subcategories'} style={{ paddingBottom: 34, overflow: 'visible', '--swiper-theme-color': '#f4f1ec' } as React.CSSProperties}>
              {subcategoryDrafts.map((sub) => (
                <SwiperSlide key={sub.id}>
                  <article className="discovery-subcategory-card" style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 5', padding: 0, textAlign: 'left', border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, background: '#222', color: '#fff', overflow: 'hidden' }}>
                    {sub.image ? <img src={sub.image} alt={sub.alt} loading="lazy" decoding="async" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.58)' }} /> : null}
                    <button type="button" onClick={() => editSubcategoryImage(sub.id)} aria-label={'Change image for ' + sub.title} title="Change image" style={overlayButton}>▧</button>
                    <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.8),rgba(0,0,0,.02) 76%)' }} />
                    <span style={{ position: 'absolute', left: 16, right: 16, bottom: 16, zIndex: 1, pointerEvents: 'auto' }}>
                      <strong style={{ display: 'block', fontSize: 18, fontWeight: 500 }}>
                        <TextEditTrigger value={sub.title} onEdit={() => beginEdit('subcategory-title-' + sub.id, sub.title)} />
                      </strong>
                      <span style={{ display: 'block', marginTop: 7, fontSize: 13, lineHeight: 1.45, fontWeight: 400, color: 'rgba(255,255,255,.82)' }}>
                        <TextEditTrigger value={sub.description} onEdit={() => beginEdit('subcategory-description-' + sub.id, sub.description)} />
                      </span>
                    </span>
                  </article>
                </SwiperSlide>
              ))}
              <SwiperSlide key="add-subcategory">
                <button type="button" onClick={addSubcategory} aria-label="Add subcategory" style={addCardStyle}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 62, height: 62, border: '1px solid rgba(255,255,255,.55)', borderRadius: '50%', fontSize: 32, lineHeight: 1 }}>+</span>
                  <span style={{ fontSize: 15, letterSpacing: '.04em' }}>Add subcategory</span>
                </button>
              </SwiperSlide>
            </Swiper>
            {isAddingSubcategory && <span aria-live="polite">Adding subcategory…</span>}
          </section>
        </main>
      )}
    </div>
    <Modal isOpen={Boolean(editingField)} onClose={cancelEdit} maxWidth="max-w-md">
      <div className="admin-market-edit-modal">
        <div className="admin-market-edit-modal__header">
          <h2>{editingField === 'add-subcategory' ? 'Add subcategory' : ((editingField === 'category-image' || editingField?.startsWith('subcategory-image-')) ? 'Edit image' : 'Edit ' + (editingField?.startsWith('category-') ? 'category' : 'subcategory') + ' ' + (editingField?.endsWith('title') ? 'title' : 'description'))}</h2>
          <p>Changes apply to this element only.</p>
        </div>
        {editingField === 'add-subcategory' ? (
          <div className="admin-market-edit-modal__fields">
            <label className="admin-market-edit-modal__field"><span>Title</span><input value={newSubcategoryTitle} onChange={(event) => setNewSubcategoryTitle(event.target.value)} autoFocus placeholder="Subcategory title" /></label>
            <label className="admin-market-edit-modal__field"><span>Description <small>Optional</small></span><textarea value={newSubcategoryDescription} onChange={(event) => setNewSubcategoryDescription(event.target.value)} rows={3} placeholder="Describe this subcategory" /></label>
            <div className="admin-market-edit-modal__image-source">
              <label className="admin-market-edit-modal__field"><span>Image link <small>Optional</small></span><input type="url" value={newSubcategoryImage.startsWith('data:') ? '' : newSubcategoryImage} onChange={(event) => setNewSubcategoryImage(event.target.value)} placeholder="Paste image URL" /></label>
              <label className="admin-market-edit-modal__device-picker">▧ Choose image from device<input type="file" accept="image/*" onChange={(event) => importDeviceImage(event.target.files?.[0], setNewSubcategoryImage)} /></label>
              {newSubcategoryImage.trim() && <img className="admin-market-edit-modal__preview" src={newSubcategoryImage} alt="Subcategory image preview" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
            </div>
          </div>
        ) : editingField === 'category-image' || editingField?.startsWith('subcategory-image-') ? (
          <div className="admin-market-edit-modal__fields">
            <div className="admin-market-edit-modal__image-source">
              <label className="admin-market-edit-modal__field"><span>Image link</span><input type="url" value={editingValue.startsWith('data:') ? '' : editingValue} onChange={(event) => setEditingValue(event.target.value)} autoFocus={!editingValue.startsWith('data:')} placeholder="Paste image URL" onKeyDown={(event) => { if (event.key === 'Enter') saveEdit(); if (event.key === 'Escape') cancelEdit(); }} /></label>
              <label className="admin-market-edit-modal__device-picker">▧ Choose image from device<input type="file" accept="image/*" onChange={(event) => importDeviceImage(event.target.files?.[0], setEditingValue)} /></label>
              {editingValue.trim() && <img className="admin-market-edit-modal__preview" src={editingValue} alt="Image preview" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
            </div>
          </div>
        ) : editingField?.endsWith('description') ? (
          <div className="admin-market-edit-modal__fields"><label className="admin-market-edit-modal__field"><span>Description</span><textarea value={editingValue} onChange={(event) => setEditingValue(event.target.value)} autoFocus rows={5} /></label></div>
        ) : (
          <div className="admin-market-edit-modal__fields"><label className="admin-market-edit-modal__field"><span>Title</span><input value={editingValue} onChange={(event) => setEditingValue(event.target.value)} autoFocus onKeyDown={(event) => { if (event.key === 'Enter') saveEdit(); if (event.key === 'Escape') cancelEdit(); }} /></label></div>
        )}
        <div className="admin-market-edit-modal__actions">
          <button type="button" onClick={cancelEdit} className="admin-market-edit-modal__button admin-market-edit-modal__button--secondary">Cancel</button>
          <button type="button" onClick={saveEdit} className="admin-market-edit-modal__button admin-market-edit-modal__button--primary">Save changes</button>
        </div>
      </div>
    </Modal>
    </>
  );
}
