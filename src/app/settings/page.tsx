'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getSupabase } from '@/lib/supabase'
import { SUPPORTED_LANGUAGES } from '@/components/LanguageSelector'
import { Button } from '@/components/ui/neon-button'
import { ArrowLeft, Save, Check } from 'lucide-react'
import Link from 'next/link'
import { LoaderInline } from '@/components/ui/loader'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const [selectedLang, setSelectedLang] = useState('EN')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user?.user_metadata?.default_target_lang) {
      setSelectedLang(user.user_metadata.default_target_lang)
    }
  }, [user, authLoading, router])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSuccess(false)

    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.updateUser({
        data: { default_target_lang: selectedLang },
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to update settings:', err)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <LoaderInline size={40} />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black text-white p-6 md:p-8'>
      <div className='max-w-2xl mx-auto space-y-8'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/' className='p-2 bg-white/5 rounded-full hover:bg-white/10 transition'>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Settings</h1>
            <p className='text-gray-400'>Manage your preferences</p>
          </div>
        </div>

        {/* Language Settings */}
        <div className='bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6'>
          <div>
            <h2 className='text-xl font-semibold mb-2'>Translation Language</h2>
            <p className='text-sm text-gray-400'>
              Select the default language you want songs translated into. This will be automatically selected when you
              open the player.
            </p>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`
                      relative p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all
                      ${
                        selectedLang === lang.code
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }
                   `}
              >
                <span className='text-3xl'>{lang.flag}</span>
                <span className='font-medium'>{lang.name}</span>
                {selectedLang === lang.code && (
                  <div className='absolute top-2 right-2 text-blue-400'>
                    <Check size={16} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className='pt-4 border-t border-white/5 flex justify-end'>
            <Button onClick={handleSave} variant='solid' disabled={saving} className='flex items-center gap-2'>
              {saving ? (
                <>
                  <LoaderInline size={16} /> Saving...
                </>
              ) : success ? (
                <>
                  <Check size={18} /> Saved
                </>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
