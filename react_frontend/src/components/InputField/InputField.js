import React from 'react';
import styles from './InputField.module.css';

function InputField({ label, name, value, onChange, placeholder, type = 'text', min, max }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={styles.input}
      />
    </div>
  );
}

export default InputField;
