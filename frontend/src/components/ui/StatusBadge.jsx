import { cn } from '@/lib/utils';

const variants = {
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  danger: "bg-red-500/10 text-red-600 border-red-500/20",
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  default: "bg-sidebar-accent text-sidebar-fg border-card-border"
};

// Map typical statuses to a variant
const statusVariantMap = {
  'Enrolled': 'primary',
  'Waitlisted': 'warning',
  'Past': 'default',
  'Available': 'success',
  'High': 'danger',
  'Medium': 'warning',
  'Low': 'info',
  'Completed': 'success',
  'Pending': 'warning',
  'Read': 'default',
  'Unread': 'primary',
  'Active': 'success',
  'Inactive': 'default'
};

export default function StatusBadge({ status, variant, className, children }) {
  const badgeVariant = variant || statusVariantMap[status] || 'default';
  
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border inline-flex items-center justify-center",
      variants[badgeVariant],
      className
    )}>
      {children || status}
    </span>
  );
}
