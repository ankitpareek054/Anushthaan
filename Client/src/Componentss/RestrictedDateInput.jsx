import React, { useState, useEffect } from 'react';

const RestrictedDateInput = ({ value: propValue, onChange, ...props }) => {
  const maxDate = '9999-12-31';
  const [value, setValue] = useState(propValue || '');

  useEffect(() => {
    setValue(propValue || '');
  }, [propValue]);

  const handleChange = (e) => {
    setValue(e.target.value);
    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    const dateStr = e.target.value;
    if (!dateStr) return;

    const [year, month, day] = dateStr.split('-');

    if (year.length > 4) {
      // Trim year to 4 digits and reconstruct the date string
      const fixedDate = `${year.slice(0, 4)}-${month || '01'}-${day || '01'}`;
      setValue(fixedDate);
      if (onChange) onChange({ ...e, target: { ...e.target, value: fixedDate } });
    }
  };

  return (
    <input
      type="date"
      value={value}
      max={maxDate}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
};


export default RestrictedDateInput;
