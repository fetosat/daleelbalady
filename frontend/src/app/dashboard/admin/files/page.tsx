import FileUploadGallery from '@/components/admin/FileUploadGallery'

export default function FilesPage() {
  return (
    <div className="container mx-auto p-6">
      <FileUploadGallery />
    </div>
  )
}

export const metadata = {
  title: 'إدارة الملفات والوسائط - دليل بلدي',
  description: 'معرض متطور لرفع وإدارة الملفات مع drag & drop وإمكانيات المعاينة'
}
