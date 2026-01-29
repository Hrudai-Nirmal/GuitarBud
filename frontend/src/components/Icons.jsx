// SVG Icon Library - Replaces all emoji usage throughout the app

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

// Guitar icon
export const GuitarIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M19.59 3H22V5H20.41L16.17 9.24C15.8 8.68 15.32 8.2 14.76 7.83L19 3.59V3H19.59ZM12 8C14.21 8 16 9.79 16 12C16 12.74 15.79 13.43 15.43 14.02L14 12.59V12C14 10.9 13.1 10 12 10H11.41L9.98 8.57C10.57 8.21 11.26 8 12 8ZM4 12C4 9.79 5.79 8 8 8C8.74 8 9.43 8.21 10.02 8.57L8.59 10H8C6.9 10 6 10.9 6 12V12.59L4.57 14.02C4.21 13.43 4 12.74 4 12ZM12 16C9.79 16 8 14.21 8 12C8 11.26 8.21 10.57 8.57 9.98L10 11.41V12C10 13.1 10.9 14 12 14H12.59L14.02 15.43C13.43 15.79 12.74 16 12 16ZM20 12C20 14.21 18.21 16 16 16C15.26 16 14.57 15.79 13.98 15.43L15.41 14H16C17.1 14 18 13.1 18 12V11.41L19.43 9.98C19.79 10.57 20 11.26 20 12ZM12 20C6.48 20 2 15.52 2 10C2 4.48 6.48 0 12 0C17.52 0 22 4.48 22 10C22 15.52 17.52 20 12 20Z" fill={color}/>
    <circle cx="12" cy="12" r="2" fill={color}/>
  </Icon>
)

// Music note icon
export const MusicNoteIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z" fill={color}/>
  </Icon>
)

// Microphone icon
export const MicrophoneIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM17.91 11C17.91 14.75 14.82 17.44 12 17.44C9.18 17.44 6.09 14.75 6.09 11H4C4 15.08 7.05 18.44 11 18.93V22H13V18.93C16.95 18.44 20 15.08 20 11H17.91Z" fill={color}/>
  </Icon>
)

// Clipboard/Setlist icon
export const ClipboardIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1C10.7 1 9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4C13 4.55 12.55 5 12 5C11.45 5 11 4.55 11 4C11 3.45 11.45 3 12 3ZM14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill={color}/>
  </Icon>
)

// Edit/Pencil icon
export const EditIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill={color}/>
  </Icon>
)

// Users/Group icon
export const UsersIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill={color}/>
  </Icon>
)

// Download icon
export const DownloadIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill={color}/>
  </Icon>
)

// Book/Lessons icon
export const BookIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill={color}/>
  </Icon>
)

// Tuner/Sliders icon
export const TunerIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M3 17V19H9V17H3ZM3 5V7H13V5H3ZM13 21V19H21V17H13V15H11V21H13ZM7 9V11H3V13H7V15H9V9H7ZM21 13V11H11V13H21ZM15 9H17V7H21V5H17V3H15V9Z" fill={color}/>
  </Icon>
)

// Scale/Staff icon
export const ScaleIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z" fill={color}/>
    <rect x="2" y="5" width="20" height="2" fill={color} opacity="0.5"/>
    <rect x="2" y="9" width="20" height="2" fill={color} opacity="0.5"/>
    <rect x="2" y="13" width="20" height="2" fill={color} opacity="0.5"/>
  </Icon>
)

// Trash/Delete icon
export const TrashIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill={color}/>
  </Icon>
)

// Save/Floppy icon
export const SaveIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19ZM15 9H5V5H15V9Z" fill={color}/>
  </Icon>
)

// Close/X icon
export const CloseIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill={color}/>
  </Icon>
)

// Arrow Up icon
export const ArrowUpIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" fill={color}/>
  </Icon>
)

// Arrow Down icon
export const ArrowDownIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill={color}/>
  </Icon>
)

// Arrow Left/Previous icon
export const ArrowLeftIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill={color}/>
  </Icon>
)

// Arrow Right/Next icon
export const ArrowRightIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" fill={color}/>
  </Icon>
)

// Play icon
export const PlayIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M8 5V19L19 12L8 5Z" fill={color}/>
  </Icon>
)

// Pause icon
export const PauseIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill={color}/>
  </Icon>
)

// Copy icon
export const CopyIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill={color}/>
  </Icon>
)

// Handshake/Join icon
export const HandshakeIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M12.22 19.85C11.83 20.24 11.2 20.24 10.81 19.85L6.29 15.33C5.9 14.94 5.9 14.31 6.29 13.92L10.81 9.4C11.2 9.01 11.83 9.01 12.22 9.4L16.74 13.92C17.13 14.31 17.13 14.94 16.74 15.33L12.22 19.85ZM3.29 10.12L7.81 5.6C8.2 5.21 8.83 5.21 9.22 5.6L13.74 10.12C14.13 10.51 14.13 11.14 13.74 11.53L9.22 16.05C8.83 16.44 8.2 16.44 7.81 16.05L3.29 11.53C2.9 11.14 2.9 10.51 3.29 10.12ZM14.78 5.6L19.3 10.12C19.69 10.51 19.69 11.14 19.3 11.53L14.78 16.05C14.39 16.44 13.76 16.44 13.37 16.05L8.85 11.53C8.46 11.14 8.46 10.51 8.85 10.12L13.37 5.6C13.76 5.21 14.39 5.21 14.78 5.6Z" fill={color}/>
  </Icon>
)

// Warning/Alert icon
export const WarningIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill={color}/>
  </Icon>
)

// Location/Pin icon
export const LocationIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill={color}/>
  </Icon>
)

// Lightbulb/Tip icon
export const LightbulbIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M9 21C9 21.55 9.45 22 10 22H14C14.55 22 15 21.55 15 21V20H9V21ZM12 2C8.14 2 5 5.14 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.14 15.86 2 12 2ZM14.85 13.1L14 13.7V16H10V13.7L9.15 13.1C7.8 12.16 7 10.63 7 9C7 6.24 9.24 4 12 4C14.76 4 17 6.24 17 9C17 10.63 16.2 12.16 14.85 13.1Z" fill={color}/>
  </Icon>
)

// Number 1 icon
export const Number1Icon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M13 7H11V17H13V7ZM11 9H9V11H11V9Z" fill={color}/>
  </Icon>
)

// Number 2 icon
export const Number2Icon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M9 9C9 7.9 9.9 7 11 7H13C14.1 7 15 7.9 15 9V10C15 11.1 14.1 12 13 12H11V15H15V17H9V12C9 10.9 9.9 10 11 10H13V9H9V9Z" fill={color}/>
  </Icon>
)

// Number 3 icon
export const Number3Icon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M9 7H15V9H11V11H13C14.1 11 15 11.9 15 13V15C15 16.1 14.1 17 13 17H9V15H13V13H9V11H11V9H9V7Z" fill={color}/>
  </Icon>
)

// Circle filled (for legends)
export const CircleFilledIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="8" fill={color}/>
  </Icon>
)

// Circle outline (for legends)
export const CircleOutlineIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="2" fill="none"/>
  </Icon>
)

// Bar/Rectangle (for legends)
export const BarIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <rect x="4" y="10" width="16" height="4" rx="1" fill={color}/>
  </Icon>
)

// Plus/Add icon
export const PlusIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill={color}/>
  </Icon>
)

// Stop icon
export const StopIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <rect x="6" y="6" width="12" height="12" fill={color}/>
  </Icon>
)

// Exit icon
export const ExitIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <Icon size={size} className={className}>
    <path d="M10.09 15.59L11.5 17L16.5 12L11.5 7L10.09 8.41L12.67 11H3V13H12.67L10.09 15.59ZM19 3H5C3.89 3 3 3.9 3 5V9H5V5H19V19H5V15H3V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill={color}/>
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
}
