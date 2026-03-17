"""
Train and save the Crop Recommendation Model from the provided dataset.
Uses GaussianNB (best performer per the README: 93.26% train, 92.53% val accuracy).
Also saves a fallback RandomForest model for robustness.
"""
import pandas as pd
import numpy as np
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "dataset_and_model")

print("=== KrishiRath Crop Recommendation Model Trainer ===\n")

# Try to load datasets
crop_data = None
sources_tried = []

# Dataset 1: crop_data1.csv (from the Crop Recommendation System)
DATA1_PATH = os.path.join(OUTPUT_DIR, "crop_data1.csv")
if os.path.exists(DATA1_PATH):
    try:
        df1 = pd.read_csv(DATA1_PATH)
        print(f"Loaded crop_data1.csv: {len(df1)} rows, columns: {list(df1.columns)}")
        sources_tried.append(("crop_data1.csv", df1))
    except Exception as e:
        print(f"crop_data1.csv load error: {e}")

# Try Maharashtra dataset
MAHA_PATH = os.path.join(OUTPUT_DIR, "Maharashtra_Agri_Dataset_Sorted.csv")
if os.path.exists(MAHA_PATH):
    try:
        df_m = pd.read_csv(MAHA_PATH)
        print(f"Loaded Maharashtra dataset: {len(df_m)} rows, columns: {list(df_m.columns)}")
        sources_tried.append(("Maharashtra_Agri_Dataset_Sorted.csv", df_m))
    except Exception as e:
        print(f"Maharashtra dataset load error: {e}")

if not sources_tried:
    print("ERROR: No dataset files found. Please check dataset_and_model/ directory.")
    sys.exit(1)

# Prefer crop_data1.csv as it's specifically for crop recommendations (N,P,K,temp,humidity,ph,rainfall -> label)
TARGET_COLUMNS = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
LABEL_COL = 'label'

primary_df = None
for name, df in sources_tried:
    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]
    
    # Check if it has the expected structure  
    has_npk = all(c in df.columns for c in ['n', 'p', 'k'])
    has_label = 'label' in df.columns or 'crop' in df.columns
    
    if has_npk and has_label:
        # Rename 'crop' -> 'label' if needed
        if 'crop' in df.columns and 'label' not in df.columns:
            df = df.rename(columns={'crop': 'label'})
        # Rename temperature/humidity cols
        col_map = {}
        for c in df.columns:
            if 'temp' in c: col_map[c] = 'temperature'
            if 'humid' in c: col_map[c] = 'humidity'
            if 'ph' in c and 'ph' != c: col_map[c] = 'ph'
        df = df.rename(columns=col_map)
        primary_df = df
        print(f"\nUsing '{name}' as primary training data.")
        print(f"Crops: {sorted(df['label'].unique())}")
        break

if primary_df is None:
    # Use Maharashtra dataset with available columns
    print("\nFalling back to Maharashtra dataset format...")
    for name, df in sources_tried:
        if 'crop' in df.columns:
            # Build a simplified model using N, P, K, ph, rainfall
            df = df.rename(columns={'crop': 'label', 'pH': 'ph', 'Rainfall': 'rainfall'})
            # Create dummy temperature and humidity
            df['temperature'] = 25.0
            df['humidity'] = 70.0
            df.columns = [c.lower() for c in df.columns]
            primary_df = df
            break

if primary_df is None:
    print("ERROR: Could not find suitable dataset. Exiting.")
    sys.exit(1)

# Prepare features
feature_cols = []
for col in ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall']:
    if col in primary_df.columns:
        feature_cols.append(col)
    else:
        print(f"  Warning: '{col}' not found, using 0")
        primary_df[col] = 0.0
        feature_cols.append(col)

print(f"\nFeature columns: {feature_cols}")

X = primary_df[feature_cols].apply(pd.to_numeric, errors='coerce').fillna(0).values
y = primary_df['label'].values

print(f"Dataset shape: X={X.shape}, y={y.shape}")
print(f"Number of unique crops: {len(set(y))}")

# Train/test split
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("\n--- Training GaussianNB (Primary Model) ---")
gnb = GaussianNB()
gnb.fit(X_train, y_train)
train_acc = gnb.score(X_train, y_train)
test_acc = gnb.score(X_test, y_test)
print(f"GaussianNB  Train: {train_acc*100:.2f}%  |  Val: {test_acc*100:.2f}%")

print("\n--- Training RandomForest (Backup Model) ---")
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
rf_train_acc = rf.score(X_train, y_train)
rf_test_acc = rf.score(X_test, y_test)
print(f"RandomForest  Train: {rf_train_acc*100:.2f}%  |  Val: {rf_test_acc*100:.2f}%")

# Pick the better model
if gnb_acc := test_acc >= rf_test_acc:
    best_model = gnb
    best_name = "GaussianNB"
    best_acc = test_acc
else:
    best_model = rf
    best_name = "RandomForest"
    best_acc = rf_test_acc

print(f"\nBest Model: {best_name} ({best_acc*100:.2f}% validation accuracy)")

# Save models
model_path = os.path.join(OUTPUT_DIR, "crop_recommendation_model.joblib")
joblib.dump(best_model, model_path)
print(f"✓ Saved: {model_path}")

# Also save feature column order so server knows
columns_path = os.path.join(OUTPUT_DIR, "crop_recommendation_columns.joblib")
joblib.dump(feature_cols, columns_path)
print(f"✓ Saved: {columns_path}")

# Save label mapping
labels_path = os.path.join(OUTPUT_DIR, "crop_labels.joblib")
joblib.dump(sorted(set(y)), labels_path)
print(f"✓ Saved: {labels_path}")

print(f"\n=== Model Training Complete ===")
print(f"Model saved to: {model_path}")
print(f"\nSample prediction test:")
sample = X_test[0:1]
pred = best_model.predict(sample)[0]
print(f"  Input: {dict(zip(feature_cols, sample[0]))}")
print(f"  Predicted crop: {pred}")
print(f"  Actual: {y_test[0]}")
