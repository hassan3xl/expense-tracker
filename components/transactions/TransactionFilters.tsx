'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Tag, Filter, X } from 'lucide-react';
import {
  FilterCard,
  FilterGrid,
  FilterField,
  FilterInput,
  FilterSelect,
  FilterSegment,
  FilterButton,
} from '@/components/ui/FilterCard';

const CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Gifts', 'Loan Borrowed', 'Debt Repayment',
  'Food & Dining', 'Rent & Housing', 'Utilities', 'Transportation', 'Shopping',
  'Entertainment', 'Healthcare', 'Loan Lent', 'Debt Payment', 'Other'
];

export default function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrl(search, type, category);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const updateUrl = (s: string, t: string, c: string) => {
    const params = new URLSearchParams();
    if (s) params.set('q', s);
    if (t) params.set('type', t);
    if (c) params.set('category', c);

    startTransition(() => {
      router.push(`/transactions?${params.toString()}`);
    });
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    updateUrl(search, newType, category);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    updateUrl(search, type, newCategory);
  };

  const handleReset = () => {
    setSearch('');
    setType('');
    setCategory('');
    startTransition(() => {
      router.push('/transactions');
    });
  };

  const hasFilters = search || type || category;

  return (
    <FilterCard>
      <FilterGrid>
        {/* Search Bar */}
        <FilterField className="flex-grow">
          <FilterInput
            type="text"
            placeholder="Search by description or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="size-4" />}
          />
        </FilterField>

        {/* Type Filter Segmented Control */}
        <FilterSegment
          value={type}
          onChange={handleTypeChange}
          options={[
            { label: 'All', value: '' },
            {
              label: 'Income',
              value: 'income',
              activeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-900 shadow-xs',
            },
            {
              label: 'Expense',
              value: 'expense',
              activeColor: 'bg-rose-950 text-rose-400 border border-rose-900 shadow-xs',
            },
          ]}
        />
      </FilterGrid>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/40">
        {/* Category Dropdown */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none">
            <Filter className="size-3.5" /> Filter Category:
          </span>
          <div className="flex-1 sm:w-64">
            <FilterSelect
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              icon={<Tag className="size-3.5" />}
            >
              <option value="" className="bg-slate-900 text-slate-400">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat}
                </option>
              ))}
            </FilterSelect>
          </div>
        </div>

        {/* Reset Filter Button */}
        {hasFilters && (
          <FilterButton
            variant="danger"
            onClick={handleReset}
            disabled={isPending}
            className="h-10"
          >
            <X className="size-3.5" />
            Clear Filters
          </FilterButton>
        )}
      </div>
    </FilterCard>
  );
}
