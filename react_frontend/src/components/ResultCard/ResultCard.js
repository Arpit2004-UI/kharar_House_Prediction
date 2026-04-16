import React, { useState, useEffect } from 'react';
import { getHouseImages } from '../../services/api';
import styles from './ResultCard.module.css';

function ResultCard({ result, formData }) {
  if (!result) return null;

  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (result.success && formData) {
      fetchImages();
    }
  }, [result]);

  const fetchImages = async () => {
    setImagesLoading(true);
    const data = await getHouseImages(formData);
    if (data.success) {
      setImages(data.images);
    }
    setImagesLoading(false);
  };

  if (!result.success) {
    return (
      <div className={`${styles.card} ${styles.error}`}>
        <p className={styles.label}>Prediction Failed</p>
        <p className={styles.errorMsg}>{result.error}</p>
      </div>
    );
  }

  const { price, sqft } = result;
  const inRupees   = (price * 100000).toLocaleString('en-IN');
  const perSqft    = sqft ? Math.round((price * 100000) / sqft).toLocaleString('en-IN') : '—';
  const rangeLow   = (price * 0.93).toFixed(1);
  const rangeHigh  = (price * 1.07).toFixed(1);

  return (
    <div className={`${styles.card} ${styles.success}`}>
      <p className={styles.label}>Estimated Price</p>

      <div className={styles.priceRow}>
        <span className={styles.rupee}>₹</span>
        <span className={styles.price}>{price.toFixed(2)}</span>
        <span className={styles.unit}>Lakhs</span>
      </div>

      <p className={styles.note}>≈ ₹{inRupees} &nbsp;·&nbsp; Model R² = 0.94</p>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Per Sqft</span>
          <span className={styles.statValue}>₹{perSqft}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Price Range</span>
          <span className={styles.statValue}>₹{rangeLow}L – ₹{rangeHigh}L</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Confidence</span>
          <span className={styles.statValue}>High (±7%)</span>
        </div>
      </div>

      {/* House Images Gallery */}
      {imagesLoading && (
        <div className={styles.imageLoading}>
          <div className={styles.spinner}></div>
          <p>Loading property images...</p>
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.imageSection}>
          <h3 className={styles.imageSectionTitle}>Property Images</h3>
          
          {/* Main Image Display */}
          <div className={styles.mainImageContainer}>
            <img 
              src={selectedImage || images[0].url} 
              alt="Property" 
              className={styles.mainImage}
            />
          </div>

          {/* Thumbnail Gallery */}
          <div className={styles.thumbnailGallery}>
            {images.map((img, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${(selectedImage || images[0].url) === img.url ? styles.active : ''}`}
                onClick={() => setSelectedImage(img.url)}
                type="button"
              >
                <img src={img.url} alt={img.title} />
                <span className={styles.thumbnailTitle}>{img.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultCard;
