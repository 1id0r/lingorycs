'use client'

import React from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/neon-button'

export interface Language {
  code: string
  name: string
  flag: string
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'EN', name: 'English', flag: '🇬🇧' },
  { code: 'HE', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'FR', name: 'French', flag: '🇫🇷' },
  { code: 'DE', name: 'German', flag: '🇩🇪' },
  { code: 'IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'PT', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'RU', name: 'Russian', flag: '🇷🇺' },
]

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (langCode: string) => void
  disabled?: boolean
}

export function LanguageSelector({ currentLanguage, onLanguageChange, disabled = false }: LanguageSelectorProps) {
  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='flex items-center gap-2 px-3 py-1.5 h-auto text-gray-300 hover:text-white hover:bg-white/10'
          disabled={disabled}
        >
          <Globe size={16} />
          <span className='hidden sm:inline text-xs font-medium'>{selectedLang.name}</span>
          <ChevronDown size={14} className='opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='bg-neutral-900 border-white/10 text-gray-200 min-w-[140px]'>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className='flex items-center justify-between cursor-pointer focus:bg-white/10 focus:text-white'
          >
            <div className='flex items-center gap-2'>
              <span className='text-base'>{lang.flag}</span>
              <span className='text-sm'>{lang.name}</span>
            </div>
            {currentLanguage === lang.code && <Check size={14} className='text-teal-400' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
