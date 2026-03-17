import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from supabase import create_client, Client
import bcrypt
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase configuration
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
if not url or not key:
    print("Warning: SUPABASE_URL or SUPABASE_KEY missing in environments")
supabase: Client = create_client(url, key)

# JWT configuration
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret")
jwt = JWTManager(app)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role')
    phone = data.get('phone', '')
    village = data.get('village', '')
    district = data.get('district', '')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        # Check if user exists
        existing_user = supabase.table("users").select("*").eq("email", email).execute()
        if existing_user.data:
            return jsonify({"error": "User already exists"}), 400

        # Insert user
        user_data = {
            "email": email,
            "password": hashed_password,
            "name": name,
            "role": role,
            "phone": phone,
            "village": village,
            "district": district
        }
        res = supabase.table("users").insert(user_data).execute()
        
        # Also create a profile entry (equipment table foreign key references profiles)
        if res.data:
            try:
                profile_data = {
                    "id": res.data[0]["id"],
                    "name": name,
                    "email": email,
                    "role": role,
                    "phone": phone,
                    "village": village,
                    "district": district,
                }
                supabase.table("profiles").insert(profile_data).execute()
            except Exception as profile_err:
                print(f"Profile creation warning: {profile_err}")
        
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        # Fetch user
        res = supabase.table("users").select("*").eq("email", email).execute()
        if not res.data:
            return jsonify({"error": "Invalid credentials"}), 401
        
        user = res.data[0]
        
        # Verify password
        if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            access_token = create_access_token(identity=str(user['id']))
            return jsonify({
                "access_token": access_token,
                "user": {
                    "id": user['id'],
                    "name": user['name'],
                    "email": user['email'],
                    "role": user['role']
                }
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    try:
        res = supabase.table("users").select("*").eq("id", user_id).execute()
        if not res.data:
            return jsonify({"error": "User not found"}), 404
        
        user = res.data[0]
        # Don't return the password
        user.pop('password', None)
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Define model and column paths using absolute paths for reliability
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "dataset_and_model", "improved_krishirath_model.joblib")
COLUMNS_PATH = os.path.join(BASE_DIR, "dataset_and_model", "improved_model_columns.joblib")
CROP_MODEL_PATH = os.path.join(BASE_DIR, "dataset_and_model", "crop_recommendation_model.joblib")
# Disease model path - uses keras h5 model already in dataset_and_model
DISEASE_MODEL_PATH = os.path.join(BASE_DIR, "dataset_and_model", "plant_disease_model.h5")
MAHARASHTRA_DATA_PATH = os.path.join(BASE_DIR, "dataset_and_model", "Maharashtra_Agri_Dataset_Sorted.csv")
MAHARASHTRA_LOCATIONS_PATH = os.path.join(BASE_DIR, "dataset_and_model", "Longitude and Latitude of Important locations in Maharashtra.csv")

# The 14 equipment types corresponding to the model's multi-label output
EQUIPMENT_CLASSES = [
    'Combine Harvester', 'Cultivator', 'Harvester', 'Mini Tractor', 
    'Paddy Transplanter', 'Planter', 'Power Tiller', 'Rotavator', 
    'Seed Drill', 'Seeder', 'Sprayer', 'Sugarcane Harvester', 
    'Tiller', 'Tractor'
]

# Global variables for model and columns
model = None
model_columns = None
crop_model = None
disease_model = None
maharashtra_data = None
maharashtra_locations = None

# Plant Disease Class Names (from local model training)
DISEASE_CLASSES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 
    'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 
    'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 
    'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
    'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy', 
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 
    'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot', 
    'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

def parse_dms(dms_str):
    """Convert DMS string e.g. '21° 18' N' to decimal 21.3"""
    try:
        # Remove common characters
        clean = dms_str.replace('°', '').replace("'", "").replace('"', '').strip()
        parts = clean.split()
        if not parts: return 0.0
        
        deg = float(parts[0])
        minutes = float(parts[1]) if len(parts) > 1 else 0
        direction = parts[2].upper() if len(parts) > 2 else 'N'
        
        decimal = deg + (minutes / 60.0)
        if direction in ['S', 'W']:
            decimal = -decimal
        return decimal
    except Exception as e:
        print(f"DMS parse error for '{dms_str}': {e}")
        return 0.0

def load_ai_assets():
    global model, model_columns, crop_model, disease_model, maharashtra_data, maharashtra_locations
    try:
        # Load Equipment model
        if os.path.exists(MODEL_PATH) and os.path.exists(COLUMNS_PATH):
            model = joblib.load(MODEL_PATH)
            model_columns = joblib.load(COLUMNS_PATH)
            print(f"Improved AI Model and Columns loaded successfully.")
        
        # Load Crop Recommendation model
        if os.path.exists(CROP_MODEL_PATH):
            crop_model = joblib.load(CROP_MODEL_PATH)
            print(f"Crop Recommendation Model loaded successfully.")

        # Load Disease Detection model (Keras)
        if os.path.exists(DISEASE_MODEL_PATH):
            try:
                import tensorflow as tf
                disease_model = tf.keras.models.load_model(DISEASE_MODEL_PATH)
                print(f"Plant Disease Model loaded successfully.")
            except Exception as e:
                print(f"Error loading Keras disease model: {e}")

        # Load Maharashtra dataset for location lookups
        if os.path.exists(MAHARASHTRA_DATA_PATH):
            maharashtra_data = pd.read_csv(MAHARASHTRA_DATA_PATH)
            print(f"Maharashtra Agri Dataset loaded ({len(maharashtra_data)} rows).")

        # Load Maharashtra locations for name lookup
        if os.path.exists(MAHARASHTRA_LOCATIONS_PATH):
            try:
                loc_df = pd.read_csv(MAHARASHTRA_LOCATIONS_PATH, on_bad_lines='skip', encoding='utf-8')
            except Exception:
                loc_df = pd.read_csv(MAHARASHTRA_LOCATIONS_PATH, on_bad_lines='skip', encoding='latin-1')
            maharashtra_locations = []
            for _, row in loc_df.iterrows():
                try:
                    maharashtra_locations.append({
                        "name": str(row['Location']),
                        "lat": parse_dms(str(row['Latitude'])),
                        "lon": parse_dms(str(row['Longitude']))
                    })
                except: continue
            print(f"Maharashtra Locations loaded ({len(maharashtra_locations)} locations).")
    except Exception as e:
        print(f"Error loading AI assets: {e}")

load_ai_assets()

@app.route('/locations', methods=['GET'])
def get_locations():
    if maharashtra_locations is None:
        # Re-attempt load if empty
        load_ai_assets()
        if maharashtra_locations is None:
            return jsonify([])
    return jsonify(maharashtra_locations)

@app.route('/location-profile', methods=['GET'])
def get_location_profile():
    if maharashtra_data is None:
        load_ai_assets()
        if maharashtra_data is None:
            return jsonify({"error": "Location data not loaded on server"}), 500
    
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        
        # Calculate Haversine or simple Euclidean distance
        # For small area like Maharashtra, Euclidean squared is fine and fast
        diff_lat = maharashtra_data['Latitude'] - lat
        diff_lon = maharashtra_data['Longitude'] - lon
        dist_sq = diff_lat**2 + diff_lon**2
        
        nearest_idx = dist_sq.idxmin()
        nearest_row = maharashtra_data.iloc[nearest_idx]
        
        return jsonify({
            "district": str(nearest_row['District']),
            "region": str(nearest_row['Region']),
            "N": float(nearest_row['N']),
            "P": float(nearest_row['P']),
            "K": float(nearest_row['K']),
            "ph": float(nearest_row['pH']),
            "rainfall": float(nearest_row['Rainfall']),
            "crop": str(nearest_row['Crop'])
        })
    except Exception as e:
        print(f"Location profile error: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or model_columns is None:
        # Try one last load
        load_ai_assets()
        if model is None or model_columns is None:
            return jsonify({"error": "AI Model not initialized on server. Check logs for loading errors."}), 500
    
    try:
        data = request.get_json()
        crop_type = data.get('crop_type')
        land_size = data.get('land_size')
        soil_type = data.get('soil_type', 'Loamy')
        
        if crop_type is None or land_size is None:
            return jsonify({"error": "crop_type and land_size are required"}), 400

        input_data = pd.DataFrame([{'land_size_acres': float(land_size), 'crop_type': crop_type, 'soil_type': soil_type}])
        input_df = pd.get_dummies(input_data)
        input_df = input_df.reindex(columns=model_columns, fill_value=0)
        
        # Ensure model exists before calling predict
        raw_prediction = model.predict(input_df)
        if isinstance(raw_prediction, list):
            binary_prediction = [p[0] for p in raw_prediction]
        else:
            binary_prediction = raw_prediction[0]
        suggestions = [EQUIPMENT_CLASSES[idx] for idx, val in enumerate(binary_prediction) if val == 1]
        if not suggestions:
            suggestions = ["Utility Tractor", "Cultivator"]
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/predict-disease', methods=['POST'])
def predict_disease():
    """Plant Disease Detection with Local Keras Model + OpenRouter AI Treatment Backup."""
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    try:
        # 1. Process for Local Model
        from PIL import Image
        import io
        
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        
        # Save temporary for OpenRouter if needed
        # (We'll send the raw bytes to OpenRouter later)
        
        predicted_class = "Unknown"
        confidence = 0.0
        details = ""

        # TRY LOCAL MODEL FIRST
        if disease_model is not None:
            try:
                import tensorflow as tf
                # Preprocess: 128x128 as per training script
                target_size = (128, 128)
                img_resized = img.resize(target_size)
                img_array = tf.keras.preprocessing.image.img_to_array(img_resized)
                img_array = np.expand_dims(img_array, axis=0) # batch size 1
                
                preds = disease_model.predict(img_array)
                idx = np.argmax(preds[0])
                predicted_class = DISEASE_CLASSES[idx]
                confidence = float(preds[0][idx])
                print(f"Local Model Prediction: {predicted_class} ({confidence:.2f})")
            except Exception as e:
                print(f"Local model prediction failed: {e}")

        # 2. CALL OPENROUTER FOR TREATMENT OR BACKUP RECOGNITION
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if api_key:
            try:
                import base64
                encoded_image = base64.b64encode(img_bytes).decode('utf-8')
                
                # Prompt: Identify disease and provide treatment
                prompt = f"Identify the plant disease in this image. If it's {predicted_class}, confirm it and provide a detailed 'Treatment' and 'Cure' guide. If it's different, provide the correct name and treatment. Focus on specific pesticides and organic remedies."
                
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": "google/gemini-2.0-flash-exp:free", # Using a free vision model as fallback
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{encoded_image}"
                                    }
                                }
                            ]
                        }
                    ]
                }
                
                response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
                if response.ok:
                    ai_data = response.json()
                    details = ai_data['choices'][0]['message']['content']
                    # Optional: Parse AI response for cleaner name if local failed
                    if predicted_class == "Unknown":
                        # (Simple heuristic extracting capitalized words from first line could work, but content is fine)
                        pass
                else:
                    print(f"OpenRouter Error: {response.text}")
            except Exception as e:
                print(f"OpenRouter integration failed: {e}")

        # Fallback details if AI fails
        if not details:
            details = "Local analysis complete. Please consult a plant doctor for specific treatment advice if symptoms persist."

        return jsonify({
            "prediction": predicted_class,
            "confidence": confidence,
            "treatment": details,
            "source": "Hybrid (Local + AI)" if api_key else "Local Model"
        })

    except Exception as e:
        print(f"Disease prediction outer error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/predict-crop', methods=['POST'])
def predict_crop():
    # Priority 1: Use Maharashtra Dataset for data-driven prediction
    if maharashtra_data is not None:
        try:
            data = request.get_json()
            # Input features: N, P, K, pH, Rainfall
            # Fallback to local data if model is unavailable or specifically requested
            n_val = float(data.get('N', 0))
            p_val = float(data.get('P', 0))
            k_val = float(data.get('K', 0))
            ph_val = float(data.get('ph', 7.0))
            rain_val = float(data.get('rainfall', 800))

            # Nearest Neighbor lookup in Maharashtra Dataset
            # Calculate distance based on N, P, K, pH, Rainfall normalize roughly
            # (Very simple approach for hackathon)
            dist = (
                (maharashtra_data['N'] - n_val)**2 + 
                (maharashtra_data['P'] - p_val)**2 + 
                (maharashtra_data['K'] - k_val)**2 + 
                ((maharashtra_data['pH'] - ph_val) * 10)**2 + 
                ((maharashtra_data['Rainfall'] - rain_val) / 10)**2
            )
            nearest_idx = dist.idxmin()
            predicted_crop = maharashtra_data.iloc[nearest_idx]['Crop']
            
            return jsonify({
                "prediction": predicted_crop,
                "source": "Maharashtra Agricultural Dataset",
                "locality": maharashtra_data.iloc[nearest_idx]['District']
            })
        except Exception as e:
            print(f"Maharashtra lookup error: {e}")
            # Fallback to model if dataset lookup fails

    # Priority 2: Use ML Model if dataset lookup didn't happen
    if crop_model is not None:
        try:
            data = request.get_json()
            features = [
                float(data.get('N', 0)),
                float(data.get('P', 0)),
                float(data.get('K', 0)),
                float(data.get('temperature', 25.0)),
                float(data.get('humidity', 70.0)),
                float(data.get('ph', 7.0)),
                float(data.get('rainfall', 800))
            ]
            prediction = crop_model.predict([features])
            return jsonify({"prediction": prediction[0], "source": "ML Model"})
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    return jsonify({"error": "No prediction source available (Model and Dataset are missing)"}), 500


# ─────────────────────────────────────────
# REVIEWS
# ─────────────────────────────────────────

@app.route('/reviews', methods=['POST'])
@jwt_required()
def submit_review():
    data = request.get_json()
    booking_id = data.get('booking_id')
    rating = data.get('rating')
    comment = data.get('comment', '')
    user_id = get_jwt_identity()

    if not booking_id or not rating:
        return jsonify({"error": "booking_id and rating required"}), 400

    try:
        result = supabase.table("reviews").insert({
            "booking_id": booking_id,
            "rating": rating,
            "comment": comment,
        }).execute()
        # Mark booking as completed
        supabase.table("bookings").update({"status": "completed"}).eq("id", booking_id).execute()
        return jsonify({"message": "Review submitted"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/reviews/<equipment_id>', methods=['GET'])
def get_reviews(equipment_id):
    try:
        bookings = supabase.table("bookings").select("id").eq("equipment_id", equipment_id).execute()
        booking_ids = [b["id"] for b in (bookings.data or [])]
        if not booking_ids:
            return jsonify({"reviews": [], "avg_rating": 0})
        reviews = supabase.table("reviews").select("*").in_("booking_id", booking_ids).execute()
        reviews_data = reviews.data or []
        count = len(reviews_data)
        avg = round(float(sum(r["rating"] for r in reviews_data) / count), 1) if count > 0 else 0.0
        return jsonify({"reviews": reviews_data, "avg_rating": avg})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────

@app.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    try:
        result = supabase.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute()
        return jsonify({"notifications": result.data or []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/notifications/read', methods=['POST'])
@jwt_required()
def mark_notifications_read():
    user_id = get_jwt_identity()
    try:
        supabase.table("notifications").update({"is_read": True}).eq("user_id", user_id).execute()
        return jsonify({"message": "All marked as read"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/notifications/send', methods=['POST'])
def send_notification():
    """Internal helper - send a notification to a user."""
    data = request.get_json()
    user_id = data.get('user_id')
    message = data.get('message')
    if not user_id or not message:
        return jsonify({"error": "user_id and message required"}), 400
    try:
        supabase.table("notifications").insert({"user_id": user_id, "message": message, "is_read": False}).execute()
        return jsonify({"message": "Notification sent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────
# ADMIN
# ─────────────────────────────────────────

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    try:
        result = supabase.table("admins").select("*").eq("email", email).single().execute()
        admin = result.data
        if not admin:
            return jsonify({"error": "Admin not found"}), 404
        if not bcrypt.checkpw(password.encode('utf-8'), admin['password'].encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401
        token = create_access_token(identity=f"admin:{admin['id']}")
        return jsonify({"token": token, "admin": {"id": admin["id"], "name": admin["name"], "email": admin["email"]}})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    identity = get_jwt_identity()
    if not str(identity).startswith("admin:"):
        return jsonify({"error": "Unauthorized"}), 403
    try:
        result = supabase.table("users").select("id, name, email, role, phone, village, district, created_at").order("created_at", desc=True).execute()
        return jsonify({"users": result.data or []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/users/<user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(user_id):
    identity = get_jwt_identity()
    if not str(identity).startswith("admin:"):
        return jsonify({"error": "Unauthorized"}), 403
    try:
        supabase.table("users").delete().eq("id", user_id).execute()
        return jsonify({"message": "User removed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/equipment', methods=['GET'])
@jwt_required()
def admin_get_equipment():
    identity = get_jwt_identity()
    if not str(identity).startswith("admin:"):
        return jsonify({"error": "Unauthorized"}), 403
    try:
        result = supabase.table("equipment").select("*").execute()
        return jsonify({"equipment": result.data or []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/equipment/<eq_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_equipment(eq_id):
    identity = get_jwt_identity()
    if not str(identity).startswith("admin:"):
        return jsonify({"error": "Unauthorized"}), 403
    try:
        supabase.table("equipment").delete().eq("id", eq_id).execute()
        return jsonify({"message": "Equipment removed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    identity = get_jwt_identity()
    if not str(identity).startswith("admin:"):
        return jsonify({"error": "Unauthorized"}), 403
    try:
        users_count = len((supabase.table("users").select("id").execute()).data or [])
        eq_count = len((supabase.table("equipment").select("id").execute()).data or [])
        bookings = supabase.table("bookings").select("status, total_price").execute().data or []
        total_bookings = len(bookings)
        total_revenue = sum(b.get("total_price", 0) for b in bookings if b.get("status") == "confirmed")
        return jsonify({
            "total_users": users_count,
            "total_equipment": eq_count,
            "total_bookings": total_bookings,
            "total_revenue": total_revenue,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("KrishiRath Intelligence Server (v3) starting on port 5001...")
    app.run(host='0.0.0.0', port=5001)
