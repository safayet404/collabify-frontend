import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns';

// ── Tailwind class merger ─────────────────────────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Date formatting ───────────────────────────────────────────
export function timeAgo(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '';
  return format(new Date(date), fmt);
}

export function formatDueDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d))    return { label: 'Today',    status: 'warning' };
  if (isTomorrow(d)) return { label: 'Tomorrow', status: 'warning' };
  if (isPast(d))     return { label: formatDate(d, 'MMM d'), status: 'overdue' };
  return { label: formatDate(d, 'MMM d'), status: 'normal' };
}

// ── String helpers ────────────────────────────────────────────
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export function truncate(str, maxLength = 50) {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

// ── Color helpers ─────────────────────────────────────────────
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function isLightColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

export function getContrastColor(hex) {
  return isLightColor(hex) ? '#1f2937' : '#ffffff';
}

// ── Priority helpers ──────────────────────────────────────────
export const PRIORITY_CONFIG = {
  none:     { label: 'None',     color: '#9CA3AF', bg: '#F3F4F6' },
  low:      { label: 'Low',      color: '#10B981', bg: '#D1FAE5' },
  medium:   { label: 'Medium',   color: '#F59E0B', bg: '#FEF3C7' },
  high:     { label: 'High',     color: '#F97316', bg: '#FFEDD5' },
  critical: { label: 'Critical', color: '#EF4444', bg: '#FEE2E2' },
};

// ── Board background ──────────────────────────────────────────
export function getBoardBackground(background) {
  if (!background) return { background: '#4F46E5' };
  if (background.type === 'gradient') return { background: background.value };
  if (background.type === 'image')    return { backgroundImage: `url(${background.value})`, backgroundSize: 'cover' };
  return { background: background.value || '#4F46E5' };
}

// ── File size formatter ───────────────────────────────────────
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ── Array helpers ─────────────────────────────────────────────
export function reorder(arr, fromIndex, toIndex) {
  const result = [...arr];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

export function moveItem(source, dest, sourceIndex, destIndex) {
  const sourceClone = [...source];
  const destClone   = [...dest];
  const [removed]   = sourceClone.splice(sourceIndex, 1);
  destClone.splice(destIndex, 0, removed);
  return { source: sourceClone, dest: destClone };
}
