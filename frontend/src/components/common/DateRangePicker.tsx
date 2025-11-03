import { Stack, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

export default function DateRangePicker({
  start,
  end,
  onChange,
}: {
  start: Dayjs;
  end: Dayjs;
  onChange: (start: Dayjs, end: Dayjs) => void;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" spacing={2} alignItems="center">
        <DatePicker enableAccessibleFieldDOMStructure={false} format="YYYY-MM-DD" label="开始" value={start} onChange={(v) => v && onChange(v, end)} slots={{ textField: TextField }} />
        <DatePicker enableAccessibleFieldDOMStructure={false} format="YYYY-MM-DD" label="结束" value={end} onChange={(v) => v && onChange(start, v)} slots={{ textField: TextField }} />
      </Stack>
    </LocalizationProvider>
  );
}

export const toParam = (d: Dayjs) => d.format('YYYY-MM-DD');
export const defaultRange = () => {
  const e = dayjs();
  const s = e.subtract(3, 'year').startOf('month');
  return { s, e };
};


