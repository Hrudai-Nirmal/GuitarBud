// SVG Icon Library - Colorful icons replacing all emoji usage throughout the app

import React from 'react'

// Wrapper for consistent icon sizing
const Icon = ({ children, size = 24, className = '', style = {}, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    {...props}
  >
    {children}
  </svg>
)

// Guitar icon - warm wood brown tones 🎸
export const GuitarIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <ellipse cx="12" cy="15" rx="6" ry="7" fill="#D4A574"/>
    <ellipse cx="12" cy="15" rx="4" ry="5" fill="#8B5A2B"/>
    <circle cx="12" cy="15" r="1.5" fill="#2C1810"/>
    <rect x="10" y="2" width="4" height="10" rx="1" fill="#CD853F"/>
    <rect x="11" y="2" width="2" height="10" fill="#8B4513"/>
    <circle cx="11" cy="3.5" r="0.5" fill="#FFD700"/>
    <circle cx="13" cy="3.5" r="0.5" fill="#FFD700"/>
    <circle cx="11" cy="5" r="0.5" fill="#FFD700"/>
    <circle cx="13" cy="5" r="0.5" fill="#FFD700"/>
    <circle cx="11" cy="6.5" r="0.5" fill="#FFD700"/>
    <circle cx="13" cy="6.5" r="0.5" fill="#FFD700"/>
  </Icon>
)

// Music note icon - vibrant purple/pink 🎵
export const MusicNoteIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <ellipse cx="7" cy="18" rx="3" ry="2.5" fill="#9333EA"/>
    <ellipse cx="17" cy="16" rx="3" ry="2.5" fill="#EC4899"/>
    <rect x="9" y="4" width="2" height="14" fill="#A855F7"/>
    <rect x="19" y="4" width="2" height="12" fill="#F472B6"/>
    <path d="M10 4C10 4 14 2 20 4V8C14 6 10 8 10 8V4Z" fill="#C084FC"/>
  </Icon>
)

// Microphone icon - metallic silver with red accent 🎤
export const MicrophoneIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="9" y="2" width="6" height="10" rx="3" fill="#A0AEC0"/>
    <rect x="10" y="3" width="4" height="3" fill="#CBD5E0"/>
    <rect x="10" y="7" width="1" height="4" fill="#718096"/>
    <rect x="12" y="7" width="1" height="4" fill="#718096"/>
    <path d="M6 10C6 13.31 8.69 16 12 16C15.31 16 18 13.31 18 10H16C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10H6Z" fill="#4A5568"/>
    <rect x="11" y="15" width="2" height="4" fill="#4A5568"/>
    <rect x="8" y="19" width="8" height="2" rx="1" fill="#2D3748"/>
    <circle cx="12" cy="4" r="1" fill="#EF4444"/>
  </Icon>
)

// Clipboard/Setlist icon - brown clipboard with white paper 📋
export const ClipboardIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="4" y="4" width="16" height="18" rx="2" fill="#92400E"/>
    <rect x="6" y="6" width="12" height="14" rx="1" fill="#FEF3C7"/>
    <rect x="8" y="1" width="8" height="4" rx="1" fill="#78350F"/>
    <circle cx="12" cy="3" r="1" fill="#FCD34D"/>
    <rect x="8" y="9" width="8" height="1.5" rx="0.5" fill="#D97706"/>
    <rect x="8" y="12" width="6" height="1.5" rx="0.5" fill="#D97706"/>
    <rect x="8" y="15" width="7" height="1.5" rx="0.5" fill="#D97706"/>
  </Icon>
)

// Edit/Pencil icon - yellow pencil ✏️
export const EditIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z" fill="#FCD34D"/>
    <path d="M20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="#9CA3AF"/>
    <path d="M3 21L6.75 17.25L3 17.25V21Z" fill="#F472B6"/>
    <rect x="14" y="6.5" width="5" height="2" transform="rotate(45 14 6.5)" fill="#F59E0B"/>
  </Icon>
)

// Users/Group icon - colorful people 👥
export const UsersIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="8" cy="8" r="3" fill="#60A5FA"/>
    <ellipse cx="8" cy="17" rx="5" ry="3" fill="#3B82F6"/>
    <circle cx="16" cy="8" r="3" fill="#F472B6"/>
    <ellipse cx="16" cy="17" rx="5" ry="3" fill="#EC4899"/>
  </Icon>
)

// Download icon - green arrow with blue base ⬇️
export const DownloadIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M12 2L12 14" stroke="#10B981" strokeWidth="3" strokeLinecap="round"/>
    <path d="M7 10L12 16L17 10" fill="#10B981"/>
    <rect x="4" y="18" width="16" height="3" rx="1" fill="#3B82F6"/>
  </Icon>
)

// Book/Lessons icon - blue book with bookmark 📚
export const BookIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" fill="#3B82F6"/>
    <rect x="6" y="4" width="12" height="16" rx="1" fill="#EFF6FF"/>
    <path d="M8 4V12L10.5 10L13 12V4H8Z" fill="#EF4444"/>
    <rect x="8" y="14" width="8" height="1" fill="#93C5FD"/>
    <rect x="8" y="16" width="6" height="1" fill="#93C5FD"/>
  </Icon>
)

// Tuner/Sliders icon - colorful equalizer bars 🎚️
export const TunerIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="3" y="8" width="2" height="10" rx="1" fill="#EF4444"/>
    <circle cx="4" cy="13" r="2" fill="#FCA5A5"/>
    <rect x="8" y="4" width="2" height="14" rx="1" fill="#F59E0B"/>
    <circle cx="9" cy="8" r="2" fill="#FCD34D"/>
    <rect x="13" y="6" width="2" height="12" rx="1" fill="#10B981"/>
    <circle cx="14" cy="14" r="2" fill="#6EE7B7"/>
    <rect x="18" y="3" width="2" height="15" rx="1" fill="#8B5CF6"/>
    <circle cx="19" cy="10" r="2" fill="#C4B5FD"/>
  </Icon>
)

// Scale/Staff icon - musical staff with notes 🎼
export const ScaleIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="2" y="5" width="20" height="1" fill="#6366F1"/>
    <rect x="2" y="9" width="20" height="1" fill="#6366F1"/>
    <rect x="2" y="13" width="20" height="1" fill="#6366F1"/>
    <rect x="2" y="17" width="20" height="1" fill="#6366F1"/>
    <ellipse cx="7" cy="11" rx="2" ry="1.5" fill="#EC4899"/>
    <rect x="8.5" y="5" width="1" height="6" fill="#EC4899"/>
    <ellipse cx="13" cy="15" rx="2" ry="1.5" fill="#8B5CF6"/>
    <rect x="14.5" y="9" width="1" height="6" fill="#8B5CF6"/>
    <ellipse cx="19" cy="9" rx="2" ry="1.5" fill="#F59E0B"/>
    <rect x="20.5" y="3" width="1" height="6" fill="#F59E0B"/>
  </Icon>
)

// Trash/Delete icon - red trash can 🗑️
export const TrashIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="5" y="6" width="14" height="15" rx="1" fill="#EF4444"/>
    <rect x="7" y="9" width="2" height="9" rx="0.5" fill="#FCA5A5"/>
    <rect x="11" y="9" width="2" height="9" rx="0.5" fill="#FCA5A5"/>
    <rect x="15" y="9" width="2" height="9" rx="0.5" fill="#FCA5A5"/>
    <rect x="3" y="4" width="18" height="2" rx="1" fill="#B91C1C"/>
    <rect x="9" y="2" width="6" height="3" rx="1" fill="#991B1B"/>
  </Icon>
)

// Save/Floppy icon - blue floppy disk 💾
export const SaveIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#3B82F6"/>
    <rect x="6" y="3" width="12" height="7" fill="#1E3A8A"/>
    <rect x="8" y="4" width="6" height="5" fill="#60A5FA"/>
    <rect x="12" y="5" width="2" height="3" fill="#1E40AF"/>
    <rect x="6" y="13" width="12" height="7" rx="1" fill="#DBEAFE"/>
    <rect x="8" y="15" width="8" height="1" fill="#93C5FD"/>
    <rect x="8" y="17" width="5" height="1" fill="#93C5FD"/>
  </Icon>
)

// Close/X icon - red X ❌
export const CloseIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#FEE2E2"/>
    <path d="M8 8L16 16M16 8L8 16" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
  </Icon>
)

// Arrow Up icon - blue chevron ⬆️
export const ArrowUpIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#DBEAFE"/>
    <path d="M8 14L12 10L16 14" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
)

// Arrow Down icon - blue chevron ⬇️
export const ArrowDownIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#DBEAFE"/>
    <path d="M8 10L12 14L16 10" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
)

// Arrow Left/Previous icon - blue chevron ⬅️
export const ArrowLeftIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#DBEAFE"/>
    <path d="M14 8L10 12L14 16" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
)

// Arrow Right/Next icon - blue chevron ➡️
export const ArrowRightIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#DBEAFE"/>
    <path d="M10 8L14 12L10 16" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
)

// Play icon - green play button ▶️
export const PlayIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#10B981"/>
    <path d="M9 7L18 12L9 17V7Z" fill="white"/>
  </Icon>
)

// Pause icon - orange pause button ⏸️
export const PauseIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#F59E0B"/>
    <rect x="8" y="7" width="3" height="10" rx="1" fill="white"/>
    <rect x="13" y="7" width="3" height="10" rx="1" fill="white"/>
  </Icon>
)

// Copy icon - blue documents 📋
export const CopyIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="8" y="6" width="12" height="15" rx="2" fill="#3B82F6"/>
    <rect x="10" y="9" width="8" height="1" fill="#BFDBFE"/>
    <rect x="10" y="12" width="6" height="1" fill="#BFDBFE"/>
    <rect x="10" y="15" width="7" height="1" fill="#BFDBFE"/>
    <rect x="4" y="3" width="12" height="15" rx="2" fill="#60A5FA"/>
    <rect x="6" y="6" width="8" height="1" fill="#DBEAFE"/>
    <rect x="6" y="9" width="6" height="1" fill="#DBEAFE"/>
    <rect x="6" y="12" width="7" height="1" fill="#DBEAFE"/>
  </Icon>
)

// Handshake/Join icon - colorful hands 🤝
export const HandshakeIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M2 11L7 7L10 9L14 6L17 8L22 5V13L17 17L14 15L10 18L7 16L2 19V11Z" fill="#FCD34D"/>
    <circle cx="7" cy="12" r="2" fill="#3B82F6"/>
    <circle cx="17" cy="11" r="2" fill="#EC4899"/>
    <path d="M9 12H15" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
  </Icon>
)

// Warning/Alert icon - yellow triangle ⚠️
export const WarningIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M12 2L1 21H23L12 2Z" fill="#FCD34D"/>
    <path d="M12 2L1 21H23L12 2Z" stroke="#F59E0B" strokeWidth="1"/>
    <rect x="11" y="9" width="2" height="6" rx="1" fill="#92400E"/>
    <circle cx="12" cy="17" r="1" fill="#92400E"/>
  </Icon>
)

// Location/Pin icon - red map pin 📍
export const LocationIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#EF4444"/>
    <circle cx="12" cy="9" r="3" fill="white"/>
  </Icon>
)

// Lightbulb/Tip icon - yellow lightbulb 💡
export const LightbulbIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M12 2C8.14 2 5 5.14 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.14 15.86 2 12 2Z" fill="#FCD34D"/>
    <rect x="9" y="19" width="6" height="1" fill="#F59E0B"/>
    <rect x="9" y="21" width="6" height="1" rx="0.5" fill="#D97706"/>
    <path d="M10 9C10 7.9 10.9 7 12 7" stroke="#FEF3C7" strokeWidth="1.5" strokeLinecap="round"/>
  </Icon>
)

// Number 1 icon - red circle with 1
export const Number1Icon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#EF4444"/>
    <path d="M13 7H11V17H13V7Z" fill="white"/>
    <path d="M11 9H9V11H11V9Z" fill="white"/>
  </Icon>
)

// Number 2 icon - orange circle with 2
export const Number2Icon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#F59E0B"/>
    <path d="M9 9C9 7.9 9.9 7 11 7H13C14.1 7 15 7.9 15 9V10C15 11.1 14.1 12 13 12H11V15H15V17H9V12C9 10.9 9.9 10 11 10H13V9H9V9Z" fill="white"/>
  </Icon>
)

// Number 3 icon - green circle with 3
export const Number3Icon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#10B981"/>
    <path d="M9 7H15V9H11V11H13C14.1 11 15 11.9 15 13V15C15 16.1 14.1 17 13 17H9V15H13V13H9V11H11V9H9V7Z" fill="white"/>
  </Icon>
)

// Circle filled (for legends) - blue
export const CircleFilledIcon = ({ size = 24, className = '', color = '#3B82F6' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="8" fill={color}/>
  </Icon>
)

// Circle outline (for legends) - blue
export const CircleOutlineIcon = ({ size = 24, className = '', color = '#3B82F6' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="2" fill="none"/>
  </Icon>
)

// Bar/Rectangle (for legends) - amber
export const BarIcon = ({ size = 24, className = '', color = '#F59E0B' }) => (
  <Icon size={size} className={className}>
    <rect x="4" y="10" width="16" height="4" rx="1" fill={color}/>
  </Icon>
)

// Plus/Add icon - green plus ➕
export const PlusIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#10B981"/>
    <path d="M12 7V17M7 12H17" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </Icon>
)

// Stop icon - red square ⏹️
export const StopIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#EF4444"/>
    <rect x="8" y="8" width="8" height="8" rx="1" fill="white"/>
  </Icon>
)

// Exit icon - red door exit 🚪
export const ExitIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="3" y="3" width="12" height="18" rx="2" fill="#6B7280"/>
    <rect x="5" y="5" width="8" height="14" fill="#D1D5DB"/>
    <circle cx="11" cy="12" r="1" fill="#F59E0B"/>
    <path d="M16 8L20 12L16 16" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 12H12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
  </Icon>
)

// Teacher icon - graduation cap 🎓
export const TeacherIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3Z" fill="#8B5CF6"/>
    <path d="M12 3L1 9L12 15L21 10.09V9L12 3Z" fill="#A78BFA"/>
    <path d="M5 11.18V17.18L12 21L19 17.18V11.18L12 15L5 11.18Z" fill="#7C3AED"/>
  </Icon>
)

// Dollar/Money icon - green dollar sign 💰
export const DollarIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" fill="#10B981"/>
    <path d="M12 6V18M9 9.5C9 8.12 10.34 7 12 7C13.66 7 15 8.12 15 9.5C15 10.88 13.66 12 12 12C10.34 12 9 13.12 9 14.5C9 15.88 10.34 17 12 17C13.66 17 15 15.88 15 14.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </Icon>
)

// Chart/Analytics icon - colorful bar chart 📊
export const ChartIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="3" y="14" width="4" height="8" rx="1" fill="#60A5FA"/>
    <rect x="10" y="8" width="4" height="14" rx="1" fill="#A78BFA"/>
    <rect x="17" y="3" width="4" height="19" rx="1" fill="#F472B6"/>
    <rect x="3" y="14" width="4" height="3" fill="#93C5FD"/>
    <rect x="10" y="8" width="4" height="3" fill="#C4B5FD"/>
    <rect x="17" y="3" width="4" height="3" fill="#F9A8D4"/>
  </Icon>
)

// Toggle On icon - green toggle
export const ToggleOnIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="2" y="7" width="20" height="10" rx="5" fill="#10B981"/>
    <circle cx="17" cy="12" r="4" fill="white"/>
  </Icon>
)

// Toggle Off icon - gray toggle
export const ToggleOffIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="2" y="7" width="20" height="10" rx="5" fill="#4B5563"/>
    <circle cx="7" cy="12" r="4" fill="white"/>
  </Icon>
)

// Search/Browse icon - teal magnifying glass 🔍
export const SearchIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <circle cx="11" cy="11" r="7" stroke="#14B8A6" strokeWidth="2.5" fill="none"/>
    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="11" cy="11" r="3" fill="rgba(20,184,166,0.2)"/>
  </Icon>
)

// Lock icon - gold padlock 🔒
export const LockIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" fill="#F59E0B"/>
    <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1.5" fill="#92400E"/>
  </Icon>
)

// Star icon - gold star ⭐
export const StarIcon = ({ size = 24, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="0.5"/>
  </Icon>
)

export default {
  GuitarIcon,
  MusicNoteIcon,
  MicrophoneIcon,
  ClipboardIcon,
  EditIcon,
  UsersIcon,
  DownloadIcon,
  BookIcon,
  TunerIcon,
  ScaleIcon,
  TrashIcon,
  SaveIcon,
  CloseIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  CopyIcon,
  HandshakeIcon,
  WarningIcon,
  LocationIcon,
  LightbulbIcon,
  Number1Icon,
  Number2Icon,
  Number3Icon,
  CircleFilledIcon,
  CircleOutlineIcon,
  BarIcon,
  PlusIcon,
  StopIcon,
  ExitIcon,
  TeacherIcon,
  DollarIcon,
  ChartIcon,  ToggleOnIcon,
  ToggleOffIcon,
  SearchIcon,
  LockIcon,
  StarIcon,
}
