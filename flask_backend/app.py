import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle



app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# ── Load model once at startup ──────────────────────────────────────────────
with open('model.pkl', 'rb') as f:
    bundle = pickle.load(f)

pipeline     = bundle['pipeline']
meta         = bundle['meta']
LOCATIONS    = meta['locations']
SOCIETY_RANK = meta['society_rank']
AREA_MAP     = meta['area_map']

# ── Helper ───────────────────────────────────────────────────────────────────
def build_features(data):
    bhk  = int(data['bhk'])
    bath = int(data['bath'])
    sqft = float(data['total_sqft'])

    return pd.DataFrame([{
        'location':       data['location'],
        'total_sqft':     sqft,
        'bath':           bath,
        'balcony':        int(data['balcony']),
        'bhk':            bhk,
        'is_ready':       1 if data['availability'] == 'Ready To Move' else 0,
        'area_type_enc':  AREA_MAP.get(data['area_type'], 1),
        'society_enc':    SOCIETY_RANK.get(data.get('society', 'other'), 4.5),
        'sqft_log':       np.log1p(sqft),
        'bath_bhk_ratio': bath / bhk,
        'total_rooms':    bhk + bath,
    }])


@app.route('/')
def home():
    return jsonify({
        "message": "Kharar House Prediction API is running 🚀"
    })

# ── Routes ───────────────────────────────────────────────────────────────────
@app.route('/api/options', methods=['GET'])
def options():
    """Return all dropdown options to the React frontend."""
    return jsonify({
        'locations':    LOCATIONS,
        'societies':    list(SOCIETY_RANK.keys()),
        'area_types':   list(AREA_MAP.keys()),
        'availability': ['Ready To Move', 'Under Construction'],
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data     = request.get_json()
        
        # Validate realistic BHK and sqft combinations
        bhk = int(data.get('bhk', 1))
        sqft = float(data.get('total_sqft', 0))
        bath = int(data.get('bath', 1))
        
        # Minimum sqft requirements for different BHK types
        min_sqft_for_bhk = {
            1: 400,   # 1 BHK needs at least 400 sqft
            2: 700,   # 2 BHK needs at least 700 sqft
            3: 1000,  # 3 BHK needs at least 1000 sqft
            4: 1400,  # 4 BHK needs at least 1400 sqft
            5: 1800   # 5+ BHK needs at least 1800 sqft
        }
        
        # Maximum sqft for realistic scenarios
        max_sqft_for_bhk = {
            1: 800,   # 1 BHK rarely exceeds 800 sqft
            2: 1500,  # 2 BHK rarely exceeds 1500 sqft
            3: 2500,  # 3 BHK rarely exceeds 2500 sqft
            4: 4000,  # 4 BHK rarely exceeds 4000 sqft
            5: 6000   # 5+ BHK rarely exceeds 6000 sqft
        }
        
        # Validate minimum sqft for BHK
        min_sqft = min_sqft_for_bhk.get(bhk, 1000)
        if sqft < min_sqft:
            return jsonify({
                'success': False, 
                'error': f'{bhk} BHK is not realistic in {sqft} sqft. Minimum {min_sqft} sqft required for {bhk} BHK.'
            }), 400
        
        # Validate maximum sqft for BHK
        max_sqft = max_sqft_for_bhk.get(bhk, 6000)
        if sqft > max_sqft:
            suggested_bhk = '4-5' if bhk < 4 else '5+'
            return jsonify({
                'success': False,
                'error': f'{bhk} BHK in {sqft} sqft is unusual. Consider {suggested_bhk} BHK for this size.'
            }), 400
        
        # Validate bathroom count
        if bath > bhk + 1:
            return jsonify({
                'success': False,
                'error': f'{bath} bathrooms is too many for {bhk} BHK. Maximum {bhk + 1} bathrooms recommended.'
            }), 400
        
        if bath < 1:
            return jsonify({
                'success': False,
                'error': 'At least 1 bathroom is required.'
            }), 400
        
        # Validate sqft per room ratio
        sqft_per_room = sqft / bhk
        if sqft_per_room < 250:
            return jsonify({
                'success': False,
                'error': f'Each room would be only {sqft_per_room:.0f} sqft, which is too small. Minimum 250 sqft per room recommended.'
            }), 400
        
        features = build_features(data)
        price    = round(float(pipeline.predict(features)[0]), 2)
        return jsonify({'success': True, 'price': price})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'GradientBoosting', 'r2': 0.83})


@app.route('/api/house-images', methods=['POST'])
def house_images():
    """Return sample house images based on location and property type."""
    try:
        data = request.get_json()
        location = data.get('location', 'Kharar')
        property_type = data.get('area_type', 'Super built-up Area')
        bhk = data.get('bhk', 3)
        
        # Sample house images from Unsplash (free real estate images)
        image_queries = {
            'exterior': f'https://source.unsplash.com/800x600/?house,exterior,modern',
            'living_room': f'https://source.unsplash.com/800x600/?living-room,interior',
            'bedroom': f'https://source.unsplash.com/800x600/?bedroom,modern',
            'kitchen': f'https://source.unsplash.com/800x600/?kitchen,modern',
        }
        
        # Return images with metadata
        images = [
            {
                'url': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
                'title': 'House Exterior',
                'type': 'exterior'
            },
            {
                'url': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
                'title': 'Front View',
                'type': 'exterior'
            },
            {
                'url': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
                'title': 'Living Room',
                'type': 'interior'
            },
            {
                'url': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
                'title': 'Bedroom',
                'type': 'interior'
            },
            {
                'url': 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
                'title': 'Kitchen',
                'type': 'interior'
            },
            {
                'url': 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop',
                'title': 'Bathroom',
                'type': 'interior'
            }
        ]
        
        return jsonify({
            'success': True,
            'images': images,
            'location': location,
            'property_type': property_type
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/house-listings', methods=['POST'])
def house_listings():
    """Return multiple house listings based on search criteria."""
    try:
        data = request.get_json()
        location = data.get('location', 'Kharar')
        bhk = data.get('bhk', 3)
        price = data.get('price', 50)
        page = data.get('page', 1)
        per_page = data.get('per_page', 12)
        
        # Generate multiple house listings with variations
        base_price = price * 100000  # Convert lakhs to rupees
        
        # Expanded image pool for variety
        all_images = [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600607687644-c7171b42a82b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop',
        ]
        
        # Shuffle images randomly each time
        random.shuffle(all_images)
        
        # Property configuration arrays
        property_types = ['Apartment', 'Villa', 'Penthouse', 'Builder Floor', 'Studio', 'Duplex', 'Independent House', 'Farmhouse']
        societies = [
            'Premium Residency', 'Green Valley Estate', 'City Heights', 'Royal Enclave',
            'Shivam Residency', 'Sunrise Towers', 'Palm Grove Society', 'Skyline Towers',
            'Green Meadows', 'Elite Residences', 'Urban Nest', 'Business Park Residency',
            'River View Heights', 'Luxury Heights', 'Metro View Apartments', 'Parkside Colony',
            'Crystal Towers', 'Emerald Gardens', 'Golden Oasis', 'Silver Springs',
            'Diamond Estate', 'Platinum Residency', 'Sapphire Towers', 'Ruby Gardens'
        ]
        
        agent_names = [
            ('Rajesh Kumar', '+91 98765 43210', 'rajesh.kumar@realty.com'),
            ('Priya Sharma', '+91 87654 32109', 'priya.sharma@realty.com'),
            ('Amit Singh', '+91 76543 21098', 'amit.singh@realty.com'),
            ('Sonia Verma', '+91 65432 10987', 'sonia.verma@realty.com'),
            ('Vikram Patel', '+91 54321 09876', 'vikram.patel@realty.com'),
            ('Meera Joshi', '+91 43210 98765', 'meera.joshi@realty.com'),
            ('Rahul Verma', '+91 98123 45678', 'rahul.verma@realty.com'),
            ('Neha Gupta', '+91 87234 56789', 'neha.gupta@realty.com'),
            ('Sanjay Malhotra', '+91 76345 67890', 'sanjay.malhotra@realty.com'),
            ('Kavita Sharma', '+91 65456 78901', 'kavita.sharma@realty.com'),
            ('Anil Kapoor', '+91 54567 89012', 'anil.kapoor@realty.com'),
            ('Pooja Singh', '+91 43678 90123', 'pooja.singh@realty.com'),
            ('Manish Agarwal', '+91 32789 01234', 'manish.agarwal@realty.com'),
            ('Sneha Reddy', '+91 21890 12345', 'sneha.reddy@realty.com'),
            ('Karan Mehta', '+91 10901 23456', 'karan.mehta@realty.com'),
            ('Anjali Desai', '+91 99012 34567', 'anjali.desai@realty.com')
        ]
        
        furnishing_types = ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished']
        facing_options = ['East Facing', 'West Facing', 'North Facing', 'South Facing', 'North-East Facing', 'North-West Facing']
        
        # Generate 55 properties dynamically
        all_listings = []
        
        for i in range(55):
            # Price varies within 85% to 115% of predicted price
            price_multiplier = 0.85 + (i * 0.30 / 55)  # 0.85 to 1.15
            current_price = round(price * price_multiplier, 2)
            
            # Sqft variation based on price
            sqft_variation = -200 + (i * 15)  # -200 to +625
            agent_idx = i % len(agent_names)
            society_idx = i % len(societies)
            image_idx = i % len(all_images)
            
            # Property type based on index
            if i % 10 == 0:
                prop_type = 'Villa'
            elif i % 8 == 0:
                prop_type = 'Penthouse'
            elif i % 6 == 0:
                prop_type = 'Duplex'
            elif i % 4 == 0:
                prop_type = 'Independent House'
            else:
                prop_type = 'Apartment'
            
            # All properties use the same BHK as user searched for
            current_bhk = bhk
            
            current_sqft = data.get('total_sqft', 1500) + sqft_variation
            
            agent_name, agent_phone, agent_email = agent_names[agent_idx]
            
            listing = {
                'id': i + 1,
                'title': f'{current_bhk} BHK {prop_type}',
                'location': location,
                'society': societies[society_idx],
                'bhk': current_bhk,
                'bath': min(data.get('bath', 2) + (i % 3), current_bhk + 1),
                'balcony': max(1, data.get('balcony', 1) + (i % 2)),
                'sqft': current_sqft,
                'price': current_price,
                'price_per_sqft': round((current_price * 100000) / current_sqft),
                'image': all_images[image_idx],
                'contact_name': agent_name,
                'contact_phone': agent_phone,
                'contact_email': agent_email,
                'amenities': ['Parking', 'Security', 'Power Backup', 'Lift', 'Water Supply'] if prop_type == 'Apartment' else ['Parking', 'Security', 'Garden', 'Power Backup'],
                'description': f'Beautiful {prop_type.lower()} with modern amenities and great ventilation.',
                'availability': data.get('availability', 'Ready To Move') if i % 3 != 0 else 'Under Construction',
                'furnishing': furnishing_types[i % 3],
                'facing': facing_options[i % 6],
                'floor': f'{(i % 15) + 1}th of {(i % 15) + 10} floors',
                'age': f'{(i % 5) + 1} years old',
                'parking': '1 Covered Parking' if i % 2 == 0 else '2 Covered Parking',
                'type': prop_type,
                'rera_approved': i % 4 != 0,
                'maintenance': f'₹{(i % 5 + 1) * 500}/month',
                'features': ['Modular Kitchen', 'Wardrobe', 'AC'] if i % 2 == 0 else ['Balcony', 'Storage', 'Intercom'],
                'nearby': ['School - 500m', 'Hospital - 1km', 'Market - 300m', 'Metro - 2km'],
                'property_id': f'PROP{i+1:03d}',
                'carpet_area': current_sqft - 200,
                'total_floors': (i % 15) + 10,
                'year_built': 2020 + (i % 5),
                'loan_available': True,
                'possession': 'Immediate' if i % 3 != 0 else 'Dec 2025',
                'facing_detail': f'{facing_options[i % 6]} with good ventilation',
                'water_supply': 'Corporation + Borewell',
                'power_backup': '100% Power Backup' if i % 2 == 0 else 'Common Areas Only',
                'security': '24/7 CCTV & Security Guard',
                'pet_friendly': i % 2 == 0,
                'furnished_details': 'Wardrobes, Kitchen Cabinets, Lights' if furnishing_types[i % 3] == 'Semi-Furnished' else 'Full furniture, ACs, Appliances' if furnishing_types[i % 3] == 'Fully-Furnished' else 'No furniture',
                'flooring': 'Vitrified Tiles' if i % 2 == 0 else 'Marble',
                'ceiling_height': '10 feet'
            }
            
            all_listings.append(listing)
        
        # Calculate pagination
        total_houses = len(all_listings)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        # Get paginated results
        paginated_listings = all_listings[start_idx:end_idx]
        
        return jsonify({
            'success': True,
            'listings': paginated_listings,
            'pagination': {
                'current_page': page,
                'per_page': per_page,
                'total_houses': total_houses,
                'total_pages': (total_houses + per_page - 1) // per_page,
                'has_next': end_idx < total_houses,
                'has_prev': page > 1
            },
            'search_criteria': {
                'location': location,
                'bhk': bhk,
                'price_range': f'₹{round(price * 0.85, 2)}L - ₹{round(price * 1.15, 2)}L'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5000)
