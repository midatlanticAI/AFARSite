// @ts-nocheck
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export type Crumb = { label: string; to?: string };

export default function BreadcrumbsNav({ items }: { items: Crumb[] }) {
  const last = items[items.length - 1];
  return (
    <Breadcrumbs sx={{ mb: 1 }}>
      {items.slice(0, -1).map((c, i) => (
        <Link key={i} component={RouterLink} underline="hover" color="inherit" to={c.to || '#'}>
          {c.label}
        </Link>
      ))}
      <Typography color="text.primary">{last.label}</Typography>
    </Breadcrumbs>
  );
}


