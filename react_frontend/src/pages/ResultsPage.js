import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHouseListings } from '../services/api';
import styles from './ResultsPage.module.css';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchListings = useCallback(async (formData, page = 1) => {
    setLoading(true);
    const payload = { ...formData, page, per_page: 12 };
    const data = await getHouseListings(payload);
    if (data.success) {
      setListings(data.listings);
      setSearchCriteria(data.search_criteria);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const formData = location.state?.formData;
    const price = location.state?.price;

    if (!formData || !price) {
      navigate('/');
      return;
    }

    fetchListings({ ...formData, price }, currentPage);
  }, [location, navigate, currentPage, fetchListings]);

  const handleBack = () => {
    navigate('/');
  };

  const handleContact = (listing) => {
    setSelectedListing(listing);
  };

  const closeContactModal = () => {
    setSelectedListing(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to mask phone number (hide first digits, show last 5)
  const maskPhoneNumber = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, ''); // Remove non-digits
    if (digits.length <= 5) return phone; // Don't mask if too short
    const visiblePart = digits.slice(-5); // Last 5 digits
    const maskedPart = 'X'.repeat(digits.length - 5); // Mask the rest
    // Return with masking
    return maskedPart + visiblePart;
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <p>Finding best properties for you...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <button onClick={handleBack} className={styles.backBtn}>
            ← Back to Search
          </button>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Available Properties</h1>
            {searchCriteria && (
              <p className={styles.criteria}>
                {searchCriteria.location} · {searchCriteria.bhk} BHK · {searchCriteria.price_range}
              </p>
            )}
          </div>
        </header>

        {/* Listings Grid */}
        <div className={styles.listingsGrid}>
          {listings.map((listing) => (
            <div key={listing.id} className={styles.listingCard}>
              <div className={styles.imageContainer}>
                <img src={listing.image} alt={listing.title} className={styles.listingImage} />
                <div className={styles.badge}>{listing.availability}</div>
              </div>
              
              <div className={styles.listingContent}>
                <div className={styles.listingHeader}>
                  <div>
                    <h3 className={styles.listingTitle}>{listing.title}</h3>
                    <p className={styles.listingSociety}>{listing.society}, {listing.location}</p>
                  </div>
                  <span className={styles.propertyId}>{listing.property_id}</span>
                </div>
                
                <div className={styles.badgeRow}>
                  <span className={`${styles.badge} ${styles.badgeAvailability}`}>{listing.availability}</span>
                  <span className={`${styles.badge} ${styles.badgeType}`}>{listing.type}</span>
                  <span className={`${styles.badge} ${styles.badgeFurnishing}`}>{listing.furnishing}</span>
                </div>

                <div className={styles.quickStats}>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatIcon}>🏠</span>
                    <div>
                      <div className={styles.quickStatValue}>{listing.bhk} BHK</div>
                      <div className={styles.quickStatLabel}>Configuration</div>
                    </div>
                  </div>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatIcon}>📐</span>
                    <div>
                      <div className={styles.quickStatValue}>{listing.sqft} sqft</div>
                      <div className={styles.quickStatLabel}>Built-up Area</div>
                    </div>
                  </div>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatIcon}>📏</span>
                    <div>
                      <div className={styles.quickStatValue}>{listing.carpet_area} sqft</div>
                      <div className={styles.quickStatLabel}>Carpet Area</div>
                    </div>
                  </div>
                </div>

                <p className={styles.listingDescription}>{listing.description}</p>

                {/* Tabs for different sections */}
                <div className={styles.tabs}>
                  <button 
                    className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('details')}
                  >
                    Details
                  </button>
                  <button 
                    className={`${styles.tab} ${activeTab === 'features' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('features')}
                  >
                    Features
                  </button>
                  <button 
                    className={`${styles.tab} ${activeTab === 'nearby' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('nearby')}
                  >
                    Nearby
                  </button>
                </div>

                {activeTab === 'details' && (
                  <div className={styles.tabContent}>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailCard}>
                        <div className={styles.detailCardIcon}>🏢</div>
                        <div className={styles.detailCardInfo}>
                          <div className={styles.detailCardLabel}>Floor</div>
                          <div className={styles.detailCardValue}>{listing.floor}</div>
                        </div>
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailCardIcon}>🧭</div>
                        <div className={styles.detailCardInfo}>
                          <div className={styles.detailCardLabel}>Facing</div>
                          <div className={styles.detailCardValue}>{listing.facing}</div>
                        </div>
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailCardIcon}>📅</div>
                        <div className={styles.detailCardInfo}>
                          <div className={styles.detailCardLabel}>Year Built</div>
                          <div className={styles.detailCardValue}>{listing.year_built}</div>
                        </div>
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailCardIcon}>🚗</div>
                        <div className={styles.detailCardInfo}>
                          <div className={styles.detailCardLabel}>Parking</div>
                          <div className={styles.detailCardValue}>{listing.parking}</div>
                        </div>
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailCardIcon}>💧</div>
                        <div className={styles.detailCardInfo}>
                          <div className={styles.detailCardLabel}>Water</div>
                          <div className={styles.detailCardValue}>{listing.water_supply}</div>
                        </div>
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailCardIcon}>⚡</div>
                        <div className={styles.detailCardInfo}>
                          <div className={styles.detailCardLabel}>Power</div>
                          <div className={styles.detailCardValue}>{listing.power_backup}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className={styles.tabContent}>
                    <div className={styles.featuresList}>
                      {listing.features.map((feature, idx) => (
                        <div key={idx} className={styles.featureItem}>
                          <span className={styles.featureCheck}>✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.extraInfo}>
                      <div className={styles.extraInfoRow}>
                        <span className={styles.extraInfoLabel}>Flooring:</span>
                        <span className={styles.extraInfoValue}>{listing.flooring}</span>
                      </div>
                      <div className={styles.extraInfoRow}>
                        <span className={styles.extraInfoLabel}>Ceiling Height:</span>
                        <span className={styles.extraInfoValue}>{listing.ceiling_height}</span>
                      </div>
                      <div className={styles.extraInfoRow}>
                        <span className={styles.extraInfoLabel}>Pet Friendly:</span>
                        <span className={styles.extraInfoValue}>{listing.pet_friendly ? '✅ Yes' : '❌ No'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'nearby' && (
                  <div className={styles.tabContent}>
                    <div className={styles.nearbyGrid}>
                      {listing.nearby.map((place, idx) => {
                        const [name, distance] = place.split(' - ');
                        return (
                          <div key={idx} className={styles.nearbyCard}>
                            <span className={styles.nearbyIcon}>📍</span>
                            <div className={styles.nearbyInfo}>
                              <div className={styles.nearbyName}>{name}</div>
                              <div className={styles.nearbyDistance}>{distance}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={styles.amenities}>
                  {listing.amenities.slice(0, 6).map((amenity, idx) => (
                    <span key={idx} className={styles.amenity}>{amenity}</span>
                  ))}
                </div>

                <div className={styles.additionalInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Maintenance</span>
                    <span className={styles.infoValue}>{listing.maintenance}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>RERA Approved</span>
                    <span className={styles.infoValue}>{listing.rera_approved ? '✅ Yes' : '❌ No'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Loan Available</span>
                    <span className={styles.infoValue}>{listing.loan_available ? '✅ Yes' : '❌ No'}</span>
                  </div>
                </div>

                <div className={styles.listingFooter}>
                  <div className={styles.priceSection}>
                    <p className={styles.price}>₹{listing.price} Lakhs</p>
                    <p className={styles.pricePerSqft}>₹{listing.price_per_sqft}/sqft</p>
                  </div>
                  <button 
                    onClick={() => handleContact(listing)}
                    className={styles.contactBtn}
                  >
                    Contact Agent
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.has_prev}
              className={styles.pageBtn}
            >
              ← Previous
            </button>
            
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ''}`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.has_next}
              className={styles.pageBtn}
            >
              Next →
            </button>
            
            <div className={styles.pageInfo}>
              Page {pagination.current_page} of {pagination.total_pages} ({pagination.total_houses} properties)
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {selectedListing && (
          <div className={styles.modal} onClick={closeContactModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button onClick={closeContactModal} className={styles.closeBtn}>×</button>
              <h2 className={styles.modalTitle}>Contact Agent</h2>
              
              <div className={styles.agentCard}>
                <div className={styles.agentAvatar}>
                  {selectedListing.contact_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={styles.agentInfo}>
                  <h3 className={styles.agentName}>{selectedListing.contact_name}</h3>
                  <p className={styles.agentRole}>Property Agent</p>
                </div>
              </div>

              <div className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>📞</span>
                  <div>
                    <p className={styles.contactLabel}>Phone</p>
                    <a href={`tel:${selectedListing.contact_phone}`} className={styles.contactValue}>
                      {maskPhoneNumber(selectedListing.contact_phone)}
                    </a>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>✉️</span>
                  <div>
                    <p className={styles.contactLabel}>Email</p>
                    <a href={`mailto:${selectedListing.contact_email}`} className={styles.contactValue}>
                      {selectedListing.contact_email}
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.propertySummary}>
                <h4>Property Details</h4>
                <p>{selectedListing.title}</p>
                <p>{selectedListing.society}, {selectedListing.location}</p>
                <p className={styles.modalPrice}>₹{selectedListing.price} Lakhs</p>
              </div>

              <div className={styles.modalActions}>
                <a href={`tel:${selectedListing.contact_phone}`} className={styles.callBtn}>
                  📞 Call Now
                </a>
                <a href={`mailto:${selectedListing.contact_email}`} className={styles.emailBtn}>
                  ✉️ Send Email
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsPage;
