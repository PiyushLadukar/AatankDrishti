from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ============================================================
# Load data at startup (FIXED)
# ============================================================
def load_data() -> pd.DataFrame:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(BASE_DIR, "gtd_processed.csv")

    if not os.path.exists(file_path):
        print("❌ ERROR: gtd_processed.csv not found in backend folder")
        return pd.DataFrame()

    print(f"✅ Loading dataset from: {file_path}")
    df = pd.read_csv(file_path, low_memory=False)
    print(f"✅ Loaded {len(df):,} rows")

    # Clean columns safely
    df['killed'] = pd.to_numeric(df.get('killed', 0), errors='coerce').fillna(0)
    df['wounded'] = pd.to_numeric(df.get('wounded', 0), errors='coerce').fillna(0)
    df['ideology'] = df.get('ideology', 'Unknown').fillna('Unknown')

    return df


# Load once
DF = load_data()


# ============================================================
# Routes
# ============================================================

@app.route("/")
def home():
    return {
        "message": "AatankDrishti API is running...",
        "status": "ok"
    }


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "rows": len(DF),
        "columns": list(DF.columns)
    })


@app.route("/api/summary")
def summary():
    if DF.empty:
        return jsonify({"error": "Dataset not loaded"}), 500

    return jsonify({
        "total_incidents": int(len(DF)),
        "years_covered": f"{int(DF['year'].min())} to {int(DF['year'].max())}" if 'year' in DF.columns else "N/A",
        "total_killed": int(DF['killed'].sum()),
        "total_wounded": int(DF['wounded'].sum()),
        "countries": int(DF['country'].nunique()) if 'country' in DF.columns else 0,
        "groups": int(DF['group_name'].nunique()) if 'group_name' in DF.columns else 0,
        "ideology_categories": int(DF['ideology'].nunique())
    })


@app.route("/api/ideology")
def ideology():
    if DF.empty or 'ideology' not in DF.columns:
        return jsonify([])

    grouped = (
        DF.groupby("ideology")
        .agg(incidents=("ideology", "count"), killed=("killed", "sum"))
        .reset_index()
        .sort_values("incidents", ascending=False)
    )

    return jsonify(grouped.to_dict(orient="records"))


@app.route("/api/timeline")
def timeline():
    if DF.empty or 'year' not in DF.columns or 'ideology' not in DF.columns:
        return jsonify([])

    grouped = (
        DF.groupby(["year", "ideology"])
        .size()
        .reset_index(name="incidents")
    )

    return jsonify(grouped.to_dict(orient="records"))


@app.route("/api/region")
def region():
    if DF.empty or 'region' not in DF.columns:
        return jsonify([])

    grouped = (
        DF.groupby(["region", "ideology"])
        .size()
        .reset_index(name="incidents")
        .sort_values("incidents", ascending=False)
    )

    return jsonify(grouped.to_dict(orient="records"))


@app.route("/api/top-groups")
def top_groups():
    if DF.empty or 'group_name' not in DF.columns:
        return jsonify([])

    grouped = (
        DF.groupby(["group_name", "ideology"])
        .agg(incidents=("group_name", "count"), killed=("killed", "sum"))
        .reset_index()
        .sort_values("incidents", ascending=False)
        .head(20)
    )

    return jsonify(grouped.to_dict(orient="records"))


@app.route("/api/religion-subtype")
def religion_subtype():
    if DF.empty or 'religion_subtype' not in DF.columns:
        return jsonify([])

    religious = DF[DF['ideology'] == 'Religious Extremist']

    if religious.empty:
        return jsonify([])

    grouped = (
        religious.groupby("religion_subtype")
        .size()
        .reset_index(name="incidents")
        .sort_values("incidents", ascending=False)
    )

    return jsonify(grouped.to_dict(orient="records"))


@app.route("/api/attack-types")
def attack_types():
    if DF.empty or 'attack_type' not in DF.columns:
        return jsonify([])

    grouped = (
        DF.groupby("attack_type")
        .size()
        .reset_index(name="incidents")
        .sort_values("incidents", ascending=False)
    )

    return jsonify(grouped.to_dict(orient="records"))


# ============================================================
if __name__ == "__main__":
    print("\nAatankDrishti API Running...")
    app.run(debug=True, port=5000)