export type Storefront = string;

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  description?: string;
  created_at?: string;
  subcategories: Subcategory[];
};

export type Editor =
  | { kind: 'new-category' }
  | { kind: 'new-subcategory'; categoryId: string }
  | { kind: 'edit-category'; id: string }
  | { kind: 'edit-subcategory'; id: string; categoryId: string };

export type CategoriesProps = {
  accessToken: string;
  adminRole: string;
  assignedStorefront: Storefront | null;
};


export type StoreRequestStatus = 'open' | 'in_progress' | 'resolved';
export type StoreRequestCategory = 'bug' | 'feature' | 'content' | 'other';
export type StoreRequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export type StoreRequest = {
  id: string;
  storefront: Storefront;
  title: string;
  category: StoreRequestCategory;
  description: string;
  priority: StoreRequestPriority;
  status: StoreRequestStatus;
  created_at: string;
};
