import type { BusinessCenterModule, BusinessCenterModuleId, SubscriptionTierId } from './types';

export const BUSINESS_CENTER_MODULES: readonly BusinessCenterModule[] = [
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    description: 'Plans, billing status, and business-tool access.',
    status: 'available',
    primaryAction: 'Manage plan',
    dependencies: [],
  },
  {
    id: 'promotions',
    title: 'Promotions',
    description: 'Create discounts and special offers for eligible products.',
    status: 'available',
    primaryAction: 'Create promotion',
    dependencies: ['subscriptions'],
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    description: 'Join and manage marketplace marketing campaigns.',
    status: 'available',
    primaryAction: 'Explore campaigns',
    dependencies: ['subscriptions', 'promotions'],
  },
  {
    id: 'advertising',
    title: 'Advertising & visibility',
    description: 'Request paid placements with transparent sponsored labeling.',
    status: 'available',
    primaryAction: 'Manage visibility',
    dependencies: ['subscriptions'],
  },
  {
    id: 'commission',
    title: 'Commission',
    description: 'Review commission policies, transaction attribution, and earnings.',
    status: 'available',
    primaryAction: 'View commission',
    dependencies: [],
  },
  {
    id: 'intelligence',
    title: 'Business intelligence',
    description: 'Understand performance, trends, and growth opportunities.',
    status: 'available',
    primaryAction: 'View insights',
    dependencies: ['campaigns', 'promotions', 'advertising'],
  },
] as const;

export const BUSINESS_CENTER_MODULE_BY_ID: Readonly<Record<BusinessCenterModuleId, BusinessCenterModule>> =
  BUSINESS_CENTER_MODULES.reduce((catalog, module) => {
    catalog[module.id] = module;
    return catalog;
  }, {} as Record<BusinessCenterModuleId, BusinessCenterModule>);

const TIER_ENTITLEMENTS: Readonly<Record<SubscriptionTierId, readonly BusinessCenterModuleId[]>> = {
  free: ['subscriptions', 'commission', 'intelligence'],
  starter: ['subscriptions', 'promotions', 'commission', 'intelligence'],
  growth: ['subscriptions', 'promotions', 'campaigns', 'commission', 'intelligence'],
  pro: ['subscriptions', 'promotions', 'campaigns', 'advertising', 'commission', 'intelligence'],
};

export const getTierModules = (tier: SubscriptionTierId): readonly BusinessCenterModuleId[] =>
  TIER_ENTITLEMENTS[tier];

export const getBusinessCenterModule = (id: BusinessCenterModuleId): BusinessCenterModule =>
  BUSINESS_CENTER_MODULE_BY_ID[id];

export const isBusinessCenterModuleId = (value: string): value is BusinessCenterModuleId =>
  value in BUSINESS_CENTER_MODULE_BY_ID;
