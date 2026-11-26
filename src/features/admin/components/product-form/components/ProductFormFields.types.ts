import type { AdminProduct, CategoryOption } from '../types';

export type ProductFormFieldsProps = {
  form: AdminProduct;
  adminRole: 'super_admin' | 'store_admin' | null | undefined;
  statusValue: string;
  setStatusValue: (value: string) => void;
  sizeInput: string;
  setSizeInput: (value: string) => void;
  categoryOptions: CategoryOption[];
  subcategoryOptions: CategoryOption[];
  isLoadingCategories: boolean;
  categoryLoadError: string | null;
  marketplaceCategoryOptions: CategoryOption[];
  marketplaceSubcategoryOptions: CategoryOption[];
  isLoadingMarketplaceTaxonomy: boolean;
  marketplaceTaxonomyError: string | null;
  isUploading: boolean;
  onChange: (field: keyof AdminProduct, value: unknown) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onAddSize: () => void;
  onRemoveSize: (size: string) => void;
};
