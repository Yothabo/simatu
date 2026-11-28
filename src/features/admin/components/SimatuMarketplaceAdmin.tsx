import React, { useState } from 'react';
import { FaPalette, FaEllipsisV } from 'react-icons/fa';
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

const categoryImageOverlayButton: React.CSSProperties = {
  position: 'absolute', zIndex: 3, top: 'auto', bottom: 'clamp(160px, 22vh, 210px)', left: '50%', right: 'auto', transform: 'translateX(-50%)', width: 38, height: 38,
  display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,.5)',
  borderRadius: '50%', background: 'rgba(15,15,15,.75)', color: '#fff', cursor: 'pointer',
  backdropFilter: 'blur(10px)', fontSize: 17,
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
  const [managedMarkets, setManagedMarkets] = useState<CategoryDraft[]>(DISCOVERY_MARKETS);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [hiddenMarketIds, setHiddenMarketIds] = useState<string[]>([]);

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
  const openAddCategory = () => { setNewCategoryName(''); setNewCategoryDescription(''); setNewCategoryImage(''); setEditingField('add-category'); };
  const saveNewCategory = () => {
    const name = newCategoryName.trim(); if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
    const created: CategoryDraft = { id, category: name, title: newCategoryDescription.trim() || name, image: newCategoryImage.trim() || DISCOVERY_MARKETS[0]?.image || '', alt: name };
    setManagedMarkets((current) => [...current, created]); setEditingField(null); setActiveMarket(created); setCategoryDraft(created); setSubcategoryDrafts([]);
  };
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
    <div className="admin-marketplace-moodboard" aria-label="Marketplace management" style={activeMarket ? { width: '100%', height: '100%', minHeight: 0, maxHeight: '100dvh', overflow: 'hidden', margin: 0, padding: 0 } : undefined}>
      {!activeMarket || !categoryDraft ? (
        <AdminMoodboardLayoutPreview items={managedMarkets} hiddenMarketIds={hiddenMarketIds} onReactivateCategory={(id) => setHiddenMarketIds((ids) => ids.filter((hiddenId) => hiddenId !== id))} onItemClick={openMarket} onAddCategory={openAddCategory} onOpenManual={() => setManualOpen(true)} onReturn={onReturn} />
      ) : (
        <main style={{ height: '100%', minHeight: 0, maxHeight: '100dvh', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', background: '#111', color: '#f4f1ec', width: '100%', maxWidth: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>
          <header className="admin-marketplace-category-header">
            <button type="button" className="admin-marketplace-category-action" onClick={returnToTiles} aria-label="Moodboard" title="Moodboard"><FaPalette aria-hidden="true" /></button>
            <button type="button" className="admin-marketplace-category-action" onClick={() => setCategoryMenuOpen((open) => !open)} aria-label="Category options" aria-expanded={categoryMenuOpen} title="Category options"><FaEllipsisV aria-hidden="true" /></button>
            {categoryMenuOpen && <div role="menu" style={{ position: 'absolute', top: 48, right: 16, width: 200, display: 'grid', gap: 2, padding: 6, border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, background: '#262626', boxShadow: '0 12px 32px rgba(0,0,0,.35)', zIndex: 20 }}>
              <button type="button" role="menuitem" onClick={() => { setHiddenMarketIds((ids) => ids.includes(activeMarket.id) ? ids : [...ids, activeMarket.id]); setCategoryMenuOpen(false); returnToTiles(); }} style={{ textAlign: 'left', border: 0, borderRadius: 6, background: 'transparent', color: '#f4f1ec', padding: '11px 12px', cursor: 'pointer' }}>Hide category</button>
              <button type="button" role="menuitem" onClick={() => { setManagedMarkets((items) => items.filter((item) => item.id !== activeMarket.id)); setCategoryMenuOpen(false); returnToTiles(); }} style={{ textAlign: 'left', border: 0, borderRadius: 6, background: 'transparent', color: '#f0a5a5', padding: '11px 12px', cursor: 'pointer' }}>Delete category</button>
            </div>}
          </header>
          <section style={{ position: 'relative', flex: '0 0 48vh', minHeight: 0, display: 'flex', alignItems: 'flex-end', padding: 0, overflow: 'hidden' }}>
            <img src={categoryDraft.image} alt={categoryDraft.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: categoryDraft.objectPosition || 'center' }} />
            <button type="button" onClick={editCategoryImage} aria-label="Edit category image" title="Edit category image" style={categoryImageOverlayButton}>▧</button>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#111 0%,rgba(17,17,17,.92) 14%,rgba(17,17,17,.38) 58%,transparent 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, padding: 'clamp(20px, 4vw, 48px)' }}>
              <h1 style={{ fontSize: 'clamp(40px,8vw,96px)', lineHeight: .95, fontWeight: 500, margin: '18px 0' }}>
                <TextEditTrigger value={categoryDraft.category} onEdit={() => beginEdit('category-title', categoryDraft.category)} />
              </h1>
              <p style={{ fontSize: 'clamp(14px,1.4vw,18px)', lineHeight: 1.65, maxWidth: 680 }}>
                <TextEditTrigger value={categoryDraft.title} onEdit={() => beginEdit('category-description', categoryDraft.title)} />
              </p>
            </div>
          </section>
          <section style={{ flex: '1 1 auto', minHeight: 290, height: 'auto', display: 'flex', flexDirection: 'column', padding: '0 clamp(16px, 4vw, 48px)', margin: 0, width: '100%', boxSizing: 'border-box', overflow: 'visible' }}>
            <Swiper className="admin-marketplace-subcategory-swiper" modules={[A11y, Keyboard, Navigation, Pagination]} slidesPerView="auto" slidesPerGroup={1} spaceBetween={16} speed={520} threshold={6} resistanceRatio={0.85} roundLengths watchSlidesProgress navigation={subcategoryDrafts.length > 2} pagination={subcategoryDrafts.length > 0 ? { clickable: true } : false} keyboard={{ enabled: true, onlyInViewport: true }} grabCursor slideToClickedSlide watchOverflow loop={false} aria-label={categoryDraft.category + ' subcategories'} style={{ width: '100%', height: 'auto', minHeight: 290, flex: '0 0 auto', padding: 0, overflow: 'visible', alignItems: 'flex-start', position: 'relative', '--swiper-theme-color': '#f4f1ec' } as React.CSSProperties}>
              {subcategoryDrafts.map((sub) => (
                <SwiperSlide key={sub.id} style={{ width: 230, height: 290, flexShrink: 0 }}>
                  <article className="discovery-subcategory-card" style={{ position: 'relative', display: 'block', width: 230, height: 290, padding: 0, textAlign: 'left', border: 0, borderRadius: 3, background: '#111', color: '#fff', overflow: 'hidden' }}>
                    {sub.image ? <img src={sub.image} alt={sub.alt} loading="lazy" decoding="async" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'none' }} /> : null}
                    <button type="button" onClick={() => editSubcategoryImage(sub.id)} aria-label={'Change image for ' + sub.title} title="Change image" style={overlayButton}>▧</button>
                    
                    <span style={{ position: 'absolute', left: 12, right: 12, bottom: 14, zIndex: 2, pointerEvents: 'auto' }}>
                      <strong style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '.04em', lineHeight: 1.3 }}>
                        <TextEditTrigger value={sub.title} onEdit={() => beginEdit('subcategory-title-' + sub.id, sub.title)} />
                      </strong>
                      <span style={{ display: 'block', marginTop: 6, fontSize: 11, lineHeight: 1.35, fontWeight: 400, color: 'rgba(255,255,255,.8)' }}>
                        <TextEditTrigger value={sub.description} onEdit={() => beginEdit('subcategory-description-' + sub.id, sub.description)} />
                      </span>
                    </span>
                  </article>
                </SwiperSlide>
              ))}
              <SwiperSlide key="add-subcategory" style={{ width: 230, height: 290, flexShrink: 0 }}>
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
        {editingField === 'add-category' ? (
          <div className="admin-market-edit-modal__fields">
            <label className="admin-market-edit-modal__field"><span>Category name</span><input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} autoFocus placeholder="New category" /></label>
            <label className="admin-market-edit-modal__field"><span>Description</span><textarea value={newCategoryDescription} onChange={(event) => setNewCategoryDescription(event.target.value)} rows={3} placeholder="Category description" /></label>
            <label className="admin-market-edit-modal__field"><span>Image URL</span><input type="url" value={newCategoryImage} onChange={(event) => setNewCategoryImage(event.target.value)} placeholder="Optional image URL" /></label>
          </div>
        ) : editingField === 'add-subcategory' ? (
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
          <button type="button" onClick={editingField === 'add-category' ? saveNewCategory : saveEdit} className="admin-market-edit-modal__button admin-market-edit-modal__button--primary">Save changes</button>
        </div>
      </div>
    </Modal>
    <Modal isOpen={manualOpen} onClose={() => setManualOpen(false)} maxWidth="max-w-md">
      <div className="admin-market-edit-modal">
        <div className="admin-market-edit-modal__header"><h2>Moodboard manual</h2></div>
        <div className="admin-market-edit-modal__fields"><p>Choose an ad shape, select Add placement, then select a tile. Click a placed ad to remove it.</p><p>Use + Category to create a category. Select a category tile to edit its content and subcategories.</p><p>Scroll the page to move through the full Moodboard canvas. Published placements use the homepage scale.</p></div>
        <div className="admin-market-edit-modal__actions"><button type="button" onClick={() => setManualOpen(false)} className="admin-market-edit-modal__button admin-market-edit-modal__button--primary">Close</button></div>
      </div>
    </Modal>
    </>
  );
}
