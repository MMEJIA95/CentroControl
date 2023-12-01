import React from 'react';
import dayjs from 'dayjs';  // Importa dayjs aquí
import 'dayjs/locale/es';  // Importa el local 'es' para español
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';

interface DatetimeComponentProps {
  label?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
}

const DatetimeComponent: React.FC<DatetimeComponentProps> = ({ label, value, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} locale={dayjs.locale('es')}>
      <DateTimePicker
        label={label}
        value={value}
        onChange={onChange}
        format="DD/MM/YYYY"
        views={['day', 'month', 'year']}
      />
    </LocalizationProvider>
  );
};

export default DatetimeComponent;
