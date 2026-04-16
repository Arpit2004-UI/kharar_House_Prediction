import React from 'react';
import styles from './SelectField.module.css';

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={styles.select}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;
