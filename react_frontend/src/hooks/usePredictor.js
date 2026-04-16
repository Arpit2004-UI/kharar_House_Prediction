import { useState } from 'react';
import { predictPrice } from '../services/api';

const DEFAULTS = {
  location:     'Sunny Enclave',
  area_type:    'Super built-up Area',
  availability: 'Ready To Move',
  total_sqft:   '',
  bhk:          3,
  bath:         2,
  balcony:      1,
};

export function usePredictor() {
  const [form,    setForm]    = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Update a single field
  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setResult(null);
    setError('');
  };

  // Client-side validation
  const validate = () => {
    const sqft = Number(form.total_sqft);
    if (!form.total_sqft || isNaN(sqft))   return 'Please enter the total sqft.';
    if (sqft < 300)                         return 'Sqft must be at least 300.';
    if (sqft > 10000)                       return 'Sqft value seems too high.';
    if (form.bath > form.bhk + 2)          return 'Too many bathrooms for the selected BHK.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationMsg = validate();
    if (validationMsg) { setError(validationMsg); return; }

    setError('');
    setLoading(true);
    setResult(null);

    const data = await predictPrice({
      ...form,
      total_sqft: Number(form.total_sqft),
    });

    if (data.success) data.sqft = Number(form.total_sqft);
    setResult(data);
    setLoading(false);
  };

  const handleReset = () => {
    setForm(DEFAULTS);
    setResult(null);
    setError('');
  };

  return { form, result, loading, error, setField, handleSubmit, handleReset };
}
