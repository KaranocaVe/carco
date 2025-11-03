import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { DataGridProps } from '@mui/x-data-grid';

export default function DataGridBase(props: DataGridProps) {
  const { slots, slotProps, density, ...rest } = props as any;
  return (
    <DataGrid
      density={density ?? 'compact'}
      pageSizeOptions={(rest as any).pageSizeOptions ?? [10, 20, 50, 100]}
      slots={{ toolbar: GridToolbar, ...(slots ?? {}) }}
      slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } }, ...(slotProps ?? {}) }}
      disableRowSelectionOnClick
      {...(rest as any)}
    />
  );
}


