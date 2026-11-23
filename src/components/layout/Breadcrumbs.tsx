import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/Icon';

export function Breadcrumbs({
  label,
  items,
}: {
  label: string;
  items: readonly { name: string; href?: string }[];
}) {
  return (
    <nav aria-label={label} className="text-sm">
      <ol className="text-muted flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <Icon name="chevronRight" size={14} className="text-subtle rtl:rotate-180" />}
            {it.href ? (
              <Link href={it.href} className="hover:text-text underline-offset-4 hover:underline">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-text">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
