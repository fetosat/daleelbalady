'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface Action<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'ghost';
  show?: (row: T) => boolean;
}

export interface Filter {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  filters?: Filter[];
  searchPlaceholder?: string;
  loading?: boolean;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  children?: React.ReactNode; // For additional buttons/controls
}

function DataTable<T extends Record<string, any>>({
  title,
  description,
  data,
  columns,
  actions = [],
  filters = [],
  searchPlaceholder = 'البحث...',
  loading = false,
  error,
  pagination,
  onSearch,
  onFilter,
  onRefresh,
  onExport,
  children
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...appliedFilters, [key]: value };
    if (!value || value === 'all') {
      delete newFilters[key];
    }
    setAppliedFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const renderCellValue = (column: Column<T>, row: T) => {
    const value = row[column.key];
    if (column.render) {
      return column.render(value, row);
    }
    return value?.toString() || '';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
            {description && <p className="text-sm text-stone-600 mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {children}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            )}
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {onSearch && (
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 h-4 w-4" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>
          )}
          
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={appliedFilters[filter.key] || 'all'}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Applied Filters */}
        {Object.keys(appliedFilters).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(appliedFilters).map(([key, value]) => {
              const filter = filters.find(f => f.key === key);
              const option = filter?.options.find(o => o.value === value);
              return (
                <Badge key={key} variant="secondary" className="px-2 py-1">
                  {filter?.label}: {option?.label}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="mr-1 text-stone-500 hover:text-stone-700"
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading && data.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-stone-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead 
                        key={column.key.toString()} 
                        className={column.sortable ? 'cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800' : ''}
                        style={column.width ? { width: column.width } : {}}
                        onClick={column.sortable ? () => handleSort(column.key.toString()) : undefined}
                      >
                        <div className="flex items-center gap-1">
                          {column.header}
                          {column.sortable && sortConfig?.key === column.key && (
                            <span className="text-xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    {actions.length > 0 && (
                      <TableHead className="w-20 text-center">إجراءات</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                        className="text-center py-8 text-stone-500"
                      >
                        لا توجد بيانات متاحة
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedData.map((row, index) => (
                      <TableRow key={index} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        {columns.map((column) => (
                          <TableCell key={column.key.toString()}>
                            {renderCellValue(column, row)}
                          </TableCell>
                        ))}
                        {actions.length > 0 && (
                          <TableCell className="text-center">
                            {actions.length === 1 ? (
                              <Button
                                size="sm"
                                variant={actions[0].variant || 'ghost'}
                                onClick={() => actions[0].onClick(row)}
                                className="h-8"
                              >
{(() => { const Icon = actions[0].icon; return Icon ? <Icon className="h-4 w-4" /> : null; })()}
                              </Button>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {actions.map((action, actionIndex) => {
                                    if (action.show && !action.show(row)) return null;
                                    const ActionIcon = action.icon;
                                    return (
                                      <DropdownMenuItem
                                        key={actionIndex}
                                        onClick={() => action.onClick(row)}
                                        className={action.variant === 'destructive' ? 'text-red-600' : ''}
                                      >
                                        {ActionIcon && <ActionIcon className="h-4 w-4 ml-2" />}
                                        {action.label}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-600">
                    عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} من{' '}
                    {pagination.total} نتيجة
                  </span>
                  
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(value) => pagination.onLimitChange(parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => pagination.onPageChange(1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => pagination.onPageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <span className="px-3 py-1 text-sm">
                    صفحة {pagination.page} من {pagination.pages}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => pagination.onPageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => pagination.onPageChange(pagination.pages)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default DataTable;
