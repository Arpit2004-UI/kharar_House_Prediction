import React from 'react';
import styles from './Counter.module.css';

function Counter({ value, onChange, min = 0, max = 10 }) {
  return (
    <div className={styles.counter}>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease"
      >−</button>

      <span className={styles.value}>{value}</span>

      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase"
      >+</button>
    </div>
  );
}

export default Counter;
