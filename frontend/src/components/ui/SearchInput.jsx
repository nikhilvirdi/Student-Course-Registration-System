import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className 
}) {
  return (
    <div className={cn("relative group", className)}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-fg group-focus-within:text-primary transition-colors" />
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        className="pl-9 pr-4 py-2 bg-card border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full transition-all"
      />
    </div>
  );
}
