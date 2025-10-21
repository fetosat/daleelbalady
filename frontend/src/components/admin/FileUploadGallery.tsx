'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, File, Image, Video, Music, FileText, Archive,
  Trash2, Download, Eye, Edit, Share, Copy, Star,
  Grid, List, Search, Filter, MoreHorizontal, X,
  Check, AlertCircle, Cloud, HardDrive, Folder,
  Calendar, User, Tag, Zap, RefreshCw, Settings
} from 'lucide-react'

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
  size: number
  url: string
  thumbnail?: string
  uploadedAt: string
  uploadedBy: string
  tags: string[]
  starred: boolean
  metadata?: {
    width?: number
    height?: number
    duration?: number
    pages?: number
  }
}

const mockFiles: MediaFile[] = [
  {
    id: '1',
    name: 'banner-main.jpg',
    type: 'image',
    size: 2048576,
    url: '/images/banner.jpg',
    thumbnail: '/images/banner-thumb.jpg',
    uploadedAt: '2024-01-20T10:30:00Z',
    uploadedBy: 'أحمد محمد',
    tags: ['تسويق', 'بانر', 'رئيسي'],
    starred: true,
    metadata: { width: 1920, height: 1080 }
  },
  {
    id: '2',
    name: 'product-catalog.pdf',
    type: 'document',
    size: 8192000,
    url: '/docs/catalog.pdf',
    uploadedAt: '2024-01-19T14:15:00Z',
    uploadedBy: 'فاطمة علي',
    tags: ['كتالوج', 'منتجات'],
    starred: false,
    metadata: { pages: 24 }
  },
  {
    id: '3',
    name: 'promo-video.mp4',
    type: 'video',
    size: 52428800,
    url: '/videos/promo.mp4',
    thumbnail: '/images/video-thumb.jpg',
    uploadedAt: '2024-01-18T16:45:00Z',
    uploadedBy: 'محمد القاضي',
    tags: ['فيديو', 'ترويجي', 'دعاية'],
    starred: true,
    metadata: { width: 1280, height: 720, duration: 120 }
  },
  {
    id: '4',
    name: 'background-music.mp3',
    type: 'audio',
    size: 4194304,
    url: '/audio/background.mp3',
    uploadedAt: '2024-01-17T09:20:00Z',
    uploadedBy: 'سارة أحمد',
    tags: ['موسيقى', 'خلفية'],
    starred: false,
    metadata: { duration: 180 }
  },
  {
    id: '5',
    name: 'assets-backup.zip',
    type: 'archive',
    size: 104857600,
    url: '/backups/assets.zip',
    uploadedAt: '2024-01-16T11:00:00Z',
    uploadedBy: 'عمر حسن',
    tags: ['نسخة احتياطية', 'أرشيف'],
    starred: false
  }
]

export default function FileUploadGallery() {
  const [files, setFiles] = useState<MediaFile[]>(mockFiles)
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return Image
      case 'video': return Video
      case 'audio': return Music
      case 'document': return FileText
      case 'archive': return Archive
      default: return File
    }
  }

  const getFileColor = (type: string) => {
    switch (type) {
      case 'image': return 'text-green-500'
      case 'video': return 'text-purple-500'
      case 'audio': return 'text-blue-500'
      case 'document': return 'text-red-500'
      case 'archive': return 'text-orange-500'
      default: return 'text-stone-500'
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = searchTerm === '' || file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || file.type === filterType
    const matchesTag = filterTag === 'all' || file.tags.includes(filterTag)
    
    return matchesSearch && matchesType && matchesTag
  })

  const allTags = Array.from(new Set(files.flatMap(file => file.tags)))

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = async (fileList: File[]) => {
    setUploading(true)
    setUploadProgress(0)

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      await simulateUpload(file)
      setUploadProgress(((i + 1) / fileList.length) * 100)
    }

    setUploading(false)
    setUploadProgress(0)
  }

  const simulateUpload = async (file: File): Promise<void> => {
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000))

    const getFileType = (mimeType: string): MediaFile['type'] => {
      if (mimeType.startsWith('image/')) return 'image'
      if (mimeType.startsWith('video/')) return 'video'
      if (mimeType.startsWith('audio/')) return 'audio'
      if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document'
      if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive'
      return 'other'
    }

    const newFile: MediaFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: getFileType(file.type),
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'المستخدم الحالي',
      tags: [],
      starred: false
    }

    setFiles(prev => [newFile, ...prev])
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    setSelectedFiles(
      selectedFiles.length === filteredFiles.length 
        ? [] 
        : filteredFiles.map(file => file.id)
    )
  }

  const toggleStar = (fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, starred: !file.starred } : file
    ))
  }

  const deleteFiles = (fileIds: string[]) => {
    setFiles(prev => prev.filter(file => !fileIds.includes(file.id)))
    setSelectedFiles([])
  }

  const downloadFile = (file: MediaFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.click()
  }

  const FileCard = ({ file }: { file: MediaFile }) => {
    const IconComponent = getFileIcon(file.type)
    const isSelected = selectedFiles.includes(file.id)

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`
          relative p-4 border-2 rounded-lg transition-all cursor-pointer
          ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-stone-200 bg-white hover:border-stone-300'}
          hover:shadow-md
        `}
        onClick={() => handleFileSelect(file.id)}
        onDoubleClick={() => setSelectedFile(file)}
      >
        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2">
          <div className={`
            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
            ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-stone-300 bg-white'}
          `}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>

        {/* Star */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation()
            toggleStar(file.id)
          }}
        >
          <Star className={`w-4 h-4 ${file.starred ? 'text-yellow-500 fill-current' : 'text-stone-400'}`} />
        </Button>

        {/* File Preview */}
        <div className="flex items-center justify-center h-32 mb-4 bg-stone-50 rounded">
          {file.type === 'image' ? (
            <img 
              src={file.thumbnail || file.url} 
              alt={file.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <IconComponent className={`w-16 h-16 ${getFileColor(file.type)}`} />
          )}
        </div>

        {/* File Info */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-stone-900 truncate" title={file.name}>
            {file.name}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{formatFileSize(file.size)}</span>
            <Badge variant="outline" className="text-xs">
              {file.type === 'image' ? 'صورة' :
               file.type === 'video' ? 'فيديو' :
               file.type === 'audio' ? 'صوت' :
               file.type === 'document' ? 'مستند' :
               file.type === 'archive' ? 'أرشيف' : 'ملف'}
            </Badge>
          </div>

          {/* Tags */}
          {file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {file.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {file.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{file.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          {file.metadata && (
            <div className="text-xs text-stone-500">
              {file.metadata.width && file.metadata.height && 
                `${file.metadata.width}×${file.metadata.height}`}
              {file.metadata.duration && 
                ` • ${Math.floor(file.metadata.duration / 60)}:${(file.metadata.duration % 60).toString().padStart(2, '0')}`}
              {file.metadata.pages && ` • ${file.metadata.pages} صفحة`}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedFile(file)
            }}
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              downloadFile(file)
            }}
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <Share className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600"
            onClick={(e) => {
              e.stopPropagation()
              deleteFiles([file.id])
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>
    )
  }

  const FileListItem = ({ file }: { file: MediaFile }) => {
    const IconComponent = getFileIcon(file.type)
    const isSelected = selectedFiles.includes(file.id)

    return (
      <motion.tr
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`
          transition-all cursor-pointer
          ${isSelected ? 'bg-blue-50' : 'hover:bg-stone-50'}
        `}
        onClick={() => handleFileSelect(file.id)}
      >
        <td className="p-4">
          <div className={`
            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
            ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-stone-300 bg-white'}
          `}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-3">
            <IconComponent className={`w-6 h-6 ${getFileColor(file.type)}`} />
            <div>
              <div className="font-medium text-stone-900">{file.name}</div>
              <div className="text-sm text-stone-500">
                {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('ar-EG')}
              </div>
            </div>
          </div>
        </td>
        <td className="p-4">
          <Badge variant="outline">
            {file.type === 'image' ? 'صورة' :
             file.type === 'video' ? 'فيديو' :
             file.type === 'audio' ? 'صوت' :
             file.type === 'document' ? 'مستند' :
             file.type === 'archive' ? 'أرشيف' : 'ملف'}
          </Badge>
        </td>
        <td className="p-4">
          <span className="text-sm text-stone-600">{file.uploadedBy}</span>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleStar(file.id)
              }}
            >
              <Star className={`w-4 h-4 ${file.starred ? 'text-yellow-500 fill-current' : 'text-stone-400'}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                downloadFile(file)
              }}
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </td>
      </motion.tr>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <Cloud className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">إدارة الملفات والوسائط</h2>
            <p className="text-sm text-stone-600">
              {filteredFiles.length.toLocaleString()} ملف • {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <HardDrive className="w-3 h-3 mr-1" />
            تخزين سحابي
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-stone-300 bg-stone-50'}
              ${uploading ? 'pointer-events-none' : 'cursor-pointer hover:border-stone-400'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(Array.from(e.target.files))
                }
              }}
            />

            {uploading ? (
              <div className="space-y-4">
                <RefreshCw className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
                <div>
                  <div className="font-medium text-stone-900">جاري الرفع...</div>
                  <div className="w-full bg-stone-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-sm text-stone-500 mt-1">{Math.round(uploadProgress)}%</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-stone-400 mx-auto" />
                <div>
                  <div className="text-lg font-medium text-stone-900">
                    اسحب الملفات هنا أو انقر للرفع
                  </div>
                  <div className="text-sm text-stone-500 mt-1">
                    يدعم جميع أنواع الملفات (صور، فيديو، مستندات، أرشيف)
                  </div>
                </div>
                <Button variant="outline">
                  <Upload className="w-4 h-4 ml-2" />
                  اختر الملفات
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                placeholder="البحث في الملفات والتاجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-500" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  <SelectItem value="image">صور</SelectItem>
                  <SelectItem value="video">فيديو</SelectItem>
                  <SelectItem value="audio">صوت</SelectItem>
                  <SelectItem value="document">مستندات</SelectItem>
                  <SelectItem value="archive">أرشيف</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="التاج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل التاجات</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedFiles.length} ملف محدد
                </span>
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                  <Download className="w-3 h-3 ml-1" />
                  تحميل المحدد
                </Button>
                <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">
                  <Tag className="w-3 h-3 ml-1" />
                  إضافة تاجات
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => deleteFiles(selectedFiles)}>
                  <Trash2 className="w-3 h-3 ml-1" />
                  حذف
                </Button>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedFiles([])}
              >
                إلغاء التحديد
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
            >
              {selectedFiles.length === filteredFiles.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </Button>
          </div>
          
          <div className="text-sm text-stone-600">
            عرض {filteredFiles.length} من أصل {files.length} ملف
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {filteredFiles.map(file => (
                <FileCard key={file.id} file={file} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b">
                    <tr>
                      <th className="w-12 p-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.length === filteredFiles.length}
                          onChange={handleSelectAll}
                          className="rounded border-stone-300"
                        />
                      </th>
                      <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                        الملف
                      </th>
                      <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                        النوع
                      </th>
                      <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                        المرفوع بواسطة
                      </th>
                      <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredFiles.map(file => (
                        <FileListItem key={file.id} file={file} />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-600 mb-2">لا توجد ملفات</h3>
            <p className="text-stone-500">لم يتم العثور على ملفات تطابق معايير البحث</p>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{selectedFile.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview */}
                <div className="space-y-4">
                  <div className="bg-stone-100 rounded-lg p-8 flex items-center justify-center min-h-64">
                    {selectedFile.type === 'image' ? (
                      <img 
                        src={selectedFile.url} 
                        alt={selectedFile.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        {React.createElement(getFileIcon(selectedFile.type), {
                          className: `w-24 h-24 ${getFileColor(selectedFile.type)} mx-auto mb-4`
                        })}
                        <p className="text-stone-600">معاينة غير متاحة لهذا النوع من الملفات</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => downloadFile(selectedFile)}>
                      <Download className="w-4 h-4 ml-2" />
                      تحميل
                    </Button>
                    <Button variant="outline">
                      <Share className="w-4 h-4 ml-2" />
                      مشاركة
                    </Button>
                    <Button variant="outline">
                      <Copy className="w-4 h-4 ml-2" />
                      نسخ الرابط
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">تفاصيل الملف</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-600">الحجم:</span>
                        <span>{formatFileSize(selectedFile.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-600">النوع:</span>
                        <span>{selectedFile.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-600">تاريخ الرفع:</span>
                        <span>{new Date(selectedFile.uploadedAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-600">المرفوع بواسطة:</span>
                        <span>{selectedFile.uploadedBy}</span>
                      </div>
                      
                      {selectedFile.metadata && (
                        <>
                          {selectedFile.metadata.width && selectedFile.metadata.height && (
                            <div className="flex justify-between">
                              <span className="text-stone-600">الأبعاد:</span>
                              <span>{selectedFile.metadata.width} × {selectedFile.metadata.height}</span>
                            </div>
                          )}
                          {selectedFile.metadata.duration && (
                            <div className="flex justify-between">
                              <span className="text-stone-600">المدة:</span>
                              <span>{Math.floor(selectedFile.metadata.duration / 60)}:{(selectedFile.metadata.duration % 60).toString().padStart(2, '0')}</span>
                            </div>
                          )}
                          {selectedFile.metadata.pages && (
                            <div className="flex justify-between">
                              <span className="text-stone-600">الصفحات:</span>
                              <span>{selectedFile.metadata.pages}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="font-medium mb-2">التاجات</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                      <Button size="sm" variant="outline" className="h-6">
                        <Tag className="w-3 h-3 ml-1" />
                        إضافة تاج
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
