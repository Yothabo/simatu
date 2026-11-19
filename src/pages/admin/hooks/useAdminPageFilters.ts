import { useEffect, useMemo, useState } from 'react';

import type {
  CategoryFilter,
  Order,
  OrderFilter,
  Storefront,
} from '../../../features/admin/types/admin.types';

import type { useAdminProducts } from '../../../features/admin/hooks/useAdminProducts';
import type { useAdminOrders } from '../../../features/admin/hooks/useAdminOrders';

const ITEMS_PER_PAGE = 20;
const ORDERS_PER_PAGE = 20;

type Products = ReturnType<typeof useAdminProducts>['products'];
type Orders = ReturnType<typeof useAdminOrders>['orders'];

interface UseAdminPageFiltersProps {
  products: Products;
  orders: Orders;
}

export function useAdminPageFilters({
  products,
  orders,
}: UseAdminPageFiltersProps) {
  const [storefrontFilter, setStorefrontFilter] = useState<'all' | Storefront>(
    'all',
  );

  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [orderFilter, setOrderFilter] = useState<OrderFilter>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);

  const storefrontProducts = useMemo(
    () =>
      storefrontFilter === 'all'
        ? products
        : products.filter(
            (product) => product.storefront === storefrontFilter,
          ),
    [products, storefrontFilter],
  );

  const storefrontOrders = useMemo(
    () =>
      storefrontFilter === 'all'
        ? orders
        : orders.filter((order) => order.storefront === storefrontFilter),
    [orders, storefrontFilter],
  );

  const filteredProducts = useMemo(() => {
    return storefrontProducts
      .filter((product) => {
        if (categoryFilter === 'Hidden') {
          if (product.is_active) return false;
        } else if (
          categoryFilter !== 'All' &&
          product.category !== categoryFilter
        ) {
          return false;
        }

        if (
          searchQuery.trim() &&
          !product.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [storefrontProducts, categoryFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [storefrontFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    if (storefrontFilter === 'yotaabo' && categoryFilter === 'Lounge') {
      setCategoryFilter('All');
    }

    if (storefrontFilter === 'poshies' && categoryFilter === 'Spaces') {
      setCategoryFilter('All');
    }
  }, [storefrontFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const filteredOrders = useMemo(() => {
    return storefrontOrders.filter((order) => {
      if (orderFilter !== 'All' && order.status !== orderFilter.toLowerCase()) {
        return false;
      }

      if (orderSearch.trim()) {
        const query = orderSearch.toLowerCase();

        const matches =
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.customer_phone.includes(orderSearch);

        if (!matches) return false;
      }

      return true;
    });
  }, [storefrontOrders, orderFilter, orderSearch]);

  useEffect(() => {
    setOrderPage(1);
  }, [storefrontFilter, orderFilter, orderSearch]);

  const totalOrderPages = Math.ceil(
    filteredOrders.length / ORDERS_PER_PAGE,
  );

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, orderPage]);

  return {
    storefrontFilter,
    setStorefrontFilter,

    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    filteredProducts,
    paginatedProducts,
    totalPages,

    orderFilter,
    setOrderFilter,
    orderSearch,
    setOrderSearch,
    orderPage,
    setOrderPage,
    filteredOrders,
    paginatedOrders,
    totalOrderPages,
  };
}
