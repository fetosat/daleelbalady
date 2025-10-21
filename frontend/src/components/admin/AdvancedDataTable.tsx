'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Download, Eye, Edit, Trash2, MoreHorizontal,
  ChevronUp, ChevronDown, ArrowUpDown, Settings, Grid3X3,
  FileSpreadsheet, FileText, Printer, RefreshCw, Plus,
  GripVertical, SortAsc, SortDesc, Columns, Star, AlertCircle
} from 'lucide-react'

interface TableColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'actions'
  sortable?: boolean
  filterable?: boolean
  width?: string
  visible?: boolean
  editable?: boolean
  format?: (value: any) => string
}

interface TableData {
  id: string
  [key: string]: any
}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

// Mock data for demonstration
const mockData: TableData[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '01234567890',
    orders: 15,
    totalSpent: 2850,
    status: 'active',
    joinDate: '2024-01-15',
    lastActivity: '2024-01-20',
    verified: true,
    city: 'كوم حمادة'
  },
  {
    id: '2',
    name: 'فاطمة علي',
    email: 'fatma@example.com',
    phone: '01123456789',
    orders: 8,
    totalSpent: 1240,
    status: 'inactive',
    joinDate: '2024-01-10',
    lastActivity: '2024-01-18',
    verified: true,
    city: 'دمنهور'
  },
  {
    id: '3',
    name: 'محمد القاضي',
    email: 'mohamed@example.com',
    phone: '01098765432',
    orders: 23,
    totalSpent: 4560,
    status: 'active',
    joinDate: '2023-12-20',
    lastActivity: '2024-01-21',
    verified: false,
    city: 'كفر الدوار'
  },
  {
    id: '4',
    name: 'سارة أحمد',
    email: 'sarah@example.com',
    phone: '01187654321',
    orders: 3,
    totalSpent: 450,
    status: 'pending',
    joinDate: '2024-01-18',
    lastActivity: '2024-01-19',
    verified: true,
    city: 'إيتاي البارود'
  },
  {
    id: '5',
    name: 'عمر حسن',
    email: 'omar@example.com',
    phone: '01276543210',
    orders: 31,
    totalSpent: 7890,
    status: 'active',
    joinDate: '2023-11-05',
    lastActivity: '2024-01-21',
    verified: true,
    city: 'كوم حمادة'
  }
]

const defaultColumns: TableColumn[] = [
  { key: 'name', label: 'الاسم', type: 'text', sortable: true, filterable: true, visible: true },
  { key: 'email', label: 'البريد الإلكتروني', type: 'text', sortable: true, filterable: true, visible: true },
  { key: 'phone', label: 'الهاتف', type: 'text', sortable: false, filterable: true, visible: true },
  { key: 'orders', label: 'الطلبات', type: 'number', sortable: true, filterable: false, visible: true },
  { key: 'totalSpent', label: 'إجمالي المبلغ', type: 'number', sortable: true, filterable: false, visible: true, 
    format: (value) => `${value.toLocaleString()} ج` },
  { key: 'status', label: 'الحالة', type: 'badge', sortable: true, filterable: true, visible: true },
  { key: 'city', label: 'المدينة', type: 'text', sortable: true, filterable: true, visible: true },
  { key: 'verified', label: 'محقق', type: 'boolean', sortable: true, filterable: true, visible: true },
  { key: 'joinDate', label: 'تاريخ التسجيل', type: 'date', sortable: true, filterable: false, visible: true },
  { key: 'actions', label: 'الإجراءات', type: 'actions', sortable: false, filterable: false, visible: true }
]

export default function AdvancedDataTable() {
  const [data, setData] = useState<TableData[]>(mockData)
  const [columns, setColumns] = useState<TableColumn[]>(defaultColumns)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' })
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const [editingCell, setEditingCell] = useState<{ rowId: string, columnKey: string } | null>(null)
  const [columnSettings, setColumnSettings] = useState(false)

  // Filter and sort data
  const processedData = useMemo(() => {
    let filteredData = data.filter(item => {
      // Global search
      const matchesSearch = searchTerm === '' || Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      // Column filters
      const matchesFilters = Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue || filterValue === 'all') return true
        return String(item[key]).toLowerCase().includes(filterValue.toLowerCase())
      })
      
      return matchesSearch && matchesFilters
    })

    // Sort data
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filteredData
  }, [data, searchTerm, filters, sortConfig])

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return processedData.slice(startIndex, startIndex + pageSize)
  }, [processedData, currentPage, pageSize])

  const totalPages = Math.ceil(processedData.length / pageSize)

  const handleSort = (columnKey: string) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectRow = (rowId: string) => {
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    )
  }

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === paginatedData.length 
        ? [] 
        : paginatedData.map(item => item.id)
    )
  }

  const handleColumnVisibility = (columnKey: string, visible: boolean) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible } : col
    ))
  }

  const exportData = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const visibleColumns = columns.filter(col => col.visible && col.type !== 'actions')
    const exportData = processedData.map(row => 
      visibleColumns.reduce((acc, col) => ({
        ...acc,
        [col.label]: col.format ? col.format(row[col.key]) : row[col.key]
      }), {})
    )

    // Here you would implement actual export logic
    console.log(`Exporting ${exportData.length} rows as ${format}:`, exportData)
    
    setIsExporting(false)
  }

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getBadgeLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      case 'pending': return 'في الانتظار'
      default: return status
    }
  }

  const renderCell = (item: TableData, column: TableColumn) => {
    const isEditing = editingCell?.rowId === item.id && editingCell?.columnKey === column.key

    if (isEditing && column.editable) {
      return (
        <Input
          defaultValue={item[column.key]}
          autoFocus
          onBlur={(e) => {
            // Update data
            setData(prev => prev.map(row => 
              row.id === item.id 
                ? { ...row, [column.key]: e.target.value }
                : row
            ))
            setEditingCell(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            } else if (e.key === 'Escape') {
              setEditingCell(null)
            }
          }}
          className="h-8 text-xs"
        />
      )
    }

    switch (column.type) {
      case 'badge':
        return (
          <Badge className={getBadgeColor(item[column.key])}>
            {getBadgeLabel(item[column.key])}
          </Badge>
        )
      case 'boolean':
        return (
          <div className="flex items-center">
            {item[column.key] ? (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs">نعم</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-xs">لا</span>
              </div>
            )}
          </div>
        )
      case 'date':
        return (
          <span className="text-xs text-stone-600">
            {new Date(item[column.key]).toLocaleDateString('ar-EG')}
          </span>
        )
      case 'actions':
        return (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Eye className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => setEditingCell({ rowId: item.id, columnKey: 'name' })}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )
      default:
        const value = column.format ? column.format(item[column.key]) : item[column.key]
        return (
          <div 
            className={`text-sm ${column.editable ? 'cursor-pointer hover:bg-stone-50 p-1 rounded' : ''}`}
            onClick={() => column.editable && setEditingCell({ rowId: item.id, columnKey: column.key })}
          >
            {value}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
            <Grid3X3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">جداول البيانات المتقدمة</h2>
            <p className="text-sm text-stone-600">إدارة وتخصيص البيانات بشكل متطور</p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {processedData.length.toLocaleString()} سجل
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setColumnSettings(!columnSettings)}
          >
            <Columns className="w-4 h-4 ml-1" />
            الأعمدة
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportData('csv')}
            disabled={isExporting}
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 ml-1 animate-spin" />
            ) : (
              <Download className="w-4 h-4 ml-1" />
            )}
            تصدير
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                placeholder="البحث في جميع الحقول..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-500" />
              <Select onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setFilters({ ...filters, city: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  <SelectItem value="كوم حمادة">كوم حمادة</SelectItem>
                  <SelectItem value="دمنهور">دمنهور</SelectItem>
                  <SelectItem value="كفر الدوار">كفر الدوار</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-600">عرض</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-stone-600">سجل</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Settings */}
      <AnimatePresence>
        {columnSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">إعدادات الأعمدة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {columns.filter(col => col.type !== 'actions').map(column => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.key}
                        checked={column.visible}
                        onCheckedChange={(checked) => 
                          handleColumnVisibility(column.key, checked as boolean)
                        }
                      />
                      <label htmlFor={column.key} className="text-sm text-stone-700">
                        {column.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedRows.length} عنصر محدد
                </span>
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                  <Edit className="w-3 h-3 ml-1" />
                  تعديل مجمع
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                  <Trash2 className="w-3 h-3 ml-1" />
                  حذف
                </Button>
                <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                  <FileSpreadsheet className="w-3 h-3 ml-1" />
                  تصدير المحدد
                </Button>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedRows([])}
              >
                إلغاء التحديد
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={selectedRows.length === paginatedData.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  {columns.filter(col => col.visible).map(column => (
                    <th 
                      key={column.key} 
                      className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => handleSort(column.key)}
                          >
                            {sortConfig.key === column.key ? (
                              sortConfig.direction === 'asc' ? (
                                <SortAsc className="w-3 h-3" />
                              ) : (
                                <SortDesc className="w-3 h-3" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                <AnimatePresence>
                  {paginatedData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-stone-50 ${selectedRows.includes(item.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedRows.includes(item.id)}
                          onCheckedChange={() => handleSelectRow(item.id)}
                        />
                      </td>
                      {columns.filter(col => col.visible).map(column => (
                        <td key={column.key} className="px-4 py-3 whitespace-nowrap">
                          {renderCell(item, column)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-stone-700">
          عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, processedData.length)} 
          من {processedData.length.toLocaleString()} سجل
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? 'default' : 'outline'}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      </div>

      {/* Export Loading */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-semibold text-stone-900">جاري التصدير</h3>
                <p className="text-sm text-stone-600">يرجى الانتظار...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
