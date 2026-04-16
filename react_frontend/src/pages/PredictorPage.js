import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Counter     from '../components/Counter/Counter';
import SelectField from '../components/SelectField/SelectField';
import InputField  from '../components/InputField/InputField';
import { usePredictor } from '../hooks/usePredictor';
import { predictPrice } from '../services/api';
import { LOCATIONS, AREA_TYPES, AVAILABILITY } from '../constants/options';
import styles from './PredictorPage.module.css';

function PredictorPage() {
  const navigate = useNavigate();
  const {
    form, loading, error,
    setField, handleReset,
  } = usePredictor();
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const sqft = Number(form.total_sqft);
    const bhk = Number(form.bhk);
    const bath = Number(form.bath);
    
    if (!form.total_sqft || isNaN(sqft)) {
      setSubmitError('Please enter the total sqft.');
      return;
    }
    
    // Frontend validation for better UX
    const minSqftMap = { 1: 400, 2: 700, 3: 1000, 4: 1400, 5: 1800 };
    const maxSqftMap = { 1: 800, 2: 1500, 3: 2500, 4: 4000, 5: 6000 };
    const minSqft = minSqftMap[bhk] || 1000;
    const maxSqft = maxSqftMap[bhk] || 6000;
    
    if (sqft < minSqft) {
      setSubmitError(`${bhk} BHK requires at least ${minSqft} sqft. Please increase the area or select fewer rooms.`);
      return;
    }
    
    if (sqft > maxSqft) {
      const suggestedBhk = bhk < 4 ? '4-5' : '5+';
      setSubmitError(`${bhk} BHK in ${sqft} sqft is unusual. Consider ${suggestedBhk} BHK for this size.`);
      return;
    }
    
    if (bath > bhk + 1) {
      setSubmitError(`Maximum ${bhk + 1} bathrooms recommended for ${bhk} BHK.`);
      return;
    }
    
    const sqftPerRoom = sqft / bhk;
    if (sqftPerRoom < 250) {
      setSubmitError(`Each room would be only ${sqftPerRoom.toFixed(0)} sqft, which is too small. Minimum 250 sqft per room recommended.`);
      return;
    }
    
    // Prepare the data to send
    const payload = {
      location: form.location,
      area_type: form.area_type,
      availability: form.availability,
      total_sqft: sqft,
      bhk: form.bhk,
      bath: form.bath,
      balcony: form.balcony,
    };
    
    console.log('Form data being sent:', payload);
    
    // Call the API directly
    setSubmitError('');
    setSubmitLoading(true);
    
    try {
      const data = await predictPrice(payload);
      
      console.log('Prediction result:', data);
      
      if (data.success) {
        // Navigate to results page with form data and price
        navigate('/results', { 
          state: { 
            formData: payload, 
            price: data.price 
          } 
        });
      } else {
        setSubmitError(data.error || 'Prediction failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError('Network error. Please check if backend is running.');
    }
    
    setSubmitLoading(false);
  };

  return (
    <div className={styles.page}>
      {/* Animated Background Elements */}
      <div className={styles.bgElements}>
        <div className={styles.bgCircle1}></div>
        <div className={styles.bgCircle2}></div>
        <div className={styles.bgCircle3}></div>
        <div className={styles.bgGrid}></div>
      </div>

      <div className={styles.wrapper}>

        {/* ── Header ───────────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🏠</span>
              <span className={styles.logoText}>HomeValue</span>
              <span className={styles.logoBadge}>AI</span>
            </div>
            <div className={styles.headerStats}>
              <div className={styles.statPill}>
                <span className={styles.statDot}></span>
                <span>R² Score: 0.83</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statDot}></span>
                <span>10K+ Predictions</span>
              </div>
            </div>
          </div>
          
          <div className={styles.heroSection}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeIcon}>✨</span>
              <span>Powered by Machine Learning</span>
            </div>
            <h1 className={styles.title}>
              Discover Your Home's
              <span className={styles.accent}> True Value</span>
            </h1>
            <p className={styles.subtitle}>
              Get instant, AI-powered property valuations for Kharar & Mohali real estate
            </p>
            <div className={styles.heroFeatures}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>⚡</span>
                <span>Instant Results</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🎯</span>
                <span>Accurate Pricing</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🏘️</span>
                <span>13+ Properties</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Form Card ────────────────────────────────────────── */}
        <div className={styles.card}>
          <form onSubmit={onSubmit} noValidate>

            {/* Section 1 — Location */}
            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>Location</h2>
              <SelectField
                label="Location"
                name="location"
                value={form.location}
                onChange={v => setField('location', v)}
                options={LOCATIONS}
              />
            </section>

            {/* Section 2 — Property Specs */}
            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>Property Specs</h2>
              <div className={styles.grid3}>
                <div className={styles.counterWrap}>
                  <p className={styles.counterLabel}>BHK</p>
                  <Counter
                    value={form.bhk}
                    onChange={v => setField('bhk', v)}
                    min={1} max={5}
                  />
                </div>
                <div className={styles.counterWrap}>
                  <p className={styles.counterLabel}>Bathrooms</p>
                  <Counter
                    value={form.bath}
                    onChange={v => setField('bath', v)}
                    min={1} max={5}
                  />
                </div>
                <div className={styles.counterWrap}>
                  <p className={styles.counterLabel}>Balconies</p>
                  <Counter
                    value={form.balcony}
                    onChange={v => setField('balcony', v)}
                    min={0} max={4}
                  />
                </div>
              </div>
            </section>

            {/* Section 3 — Area & Type */}
            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>Area & Type</h2>
              <div className={styles.grid2}>
                <InputField
                  label="Total Sqft"
                  name="total_sqft"
                  type="number"
                  value={form.total_sqft}
                  onChange={v => setField('total_sqft', v)}
                  placeholder="e.g. 1500"
                  min={300}
                  max={10000}
                />
                <SelectField
                  label="Area Type"
                  name="area_type"
                  value={form.area_type}
                  onChange={v => setField('area_type', v)}
                  options={AREA_TYPES}
                />
              </div>
              <div className={styles.singleRow}>
                <SelectField
                  label="Availability"
                  name="availability"
                  value={form.availability}
                  onChange={v => setField('availability', v)}
                  options={AVAILABILITY}
                />
              </div>
            </section>

            {/* Validation error */}
            {(error || submitError) && <p className={styles.errorMsg}>{error || submitError}</p>}

            {/* Actions */}
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.btnPredict}
                disabled={submitLoading}
              >
                {submitLoading
                  ? <><span className={styles.spinner} /> Finding Properties…</>
                  : '🔍 View Available Properties'
                }
              </button>
              <button
                type="button"
                className={styles.btnReset}
                onClick={handleReset}
              >
                Reset
              </button>
            </div>

          </form>
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className={styles.footer}>
          React + Flask &nbsp;·&nbsp; Kharar / Mohali Real Estate &nbsp;·&nbsp; Model R² 0.83
        </footer>

      </div>
    </div>
  );
}

export default PredictorPage;
