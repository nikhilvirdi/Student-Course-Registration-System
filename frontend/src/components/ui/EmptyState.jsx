import { cn } from '@/lib/utils';
import { FileQuestion } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = FileQuestion, 
  title = "No data found", 
  description = "Get started by creating a new entry.", 
  action,
  className
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      "bg-card/50 border border-dashed border-border rounded-xl",
      "min-h-[400px] w-full",
      className
    )}>
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
