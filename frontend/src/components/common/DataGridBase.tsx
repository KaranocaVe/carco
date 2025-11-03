import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { DataGridProps } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

function NoRows() {
  return (
    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
      <Typography variant="body2">暂无数据</Typography>
      <Typography variant="caption">试试调整筛选条件或时间范围</Typography>
    </Box>
  );
}

export default function DataGridBase(props: DataGridProps) {
  const { slots, slotProps, density, ...rest } = props as any;
  return (
    <DataGrid
      density={density ?? 'compact'}
      pageSizeOptions={(rest as any).pageSizeOptions ?? [10, 20, 50, 100]}
      slots={{ toolbar: GridToolbar, noRowsOverlay: NoRows, ...(slots ?? {}) }}
      slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } }, ...(slotProps ?? {}) }}
      disableRowSelectionOnClick
      {...(rest as any)}
    />
  );
}


