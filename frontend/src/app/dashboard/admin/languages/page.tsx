import MultiLanguageSupport from '@/components/admin/MultiLanguageSupport'

export default function LanguagesPage() {
  return (
    <div className="container mx-auto p-6">
      <MultiLanguageSupport />
    </div>
  )
}

export const metadata = {
  title: 'إدارة اللغات والترجمة - دليل بلدي',
  description: 'نظام شامل لإدارة اللغات والترجمات مع دعم RTL/LTR'
}
