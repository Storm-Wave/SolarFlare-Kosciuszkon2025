import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import joblib
import matplotlib.pyplot as plt
import requests
import pandas as pd
from datetime import datetime, timedelta, date

features = ['hour', 'month', 'dayofyear', 'weekday', "dayssinceepoch"]


# 1. Wczytanie danych
def load_data(file_path):
    df = pd.read_csv(file_path, parse_dates=[0])
    df.columns = ['timestamp', 'buyPrice']
    return df

# 2. Feature engineering
def extract_features(df):
    df['hour'] = df['timestamp'].dt.hour
    df['month'] = df['timestamp'].dt.month
    df['dayofyear'] = df['timestamp'].dt.dayofyear
    df['weekday'] = df['timestamp'].dt.weekday
    df["dayssinceepoch"] = [i.days for i in df["timestamp"] - datetime(1970, 1, 1)]
    return df

# 3. Przygotowanie danych do modelowania
def prepare_data(df):
    X = df[features]
    y = df['buyPrice']
    return train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Trenowanie i wybór najlepszego modelu
def train_models(X_train, y_train, X_test, y_test):
    models = {
        'LinearRegression': LinearRegression(),
        'RandomForest': RandomForestRegressor(n_estimators=100, random_state=42),
        'GradientBoosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
    }

    best_model = None
    best_rmse = float('inf')

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        rmse = mean_squared_error(y_test, preds)
        r2 = r2_score(y_test, preds)
        print(f"{name}: RMSE = {rmse:.2f}, R² = {r2:.3f}")

        if rmse < best_rmse:
            best_rmse = rmse
            best_model = model
            best_model_name = name

    print(f"\nBest model: {best_model_name} (RMSE: {best_rmse:.2f})")
    return best_model

# 5. Zapisz model
def save_model(model, filename='best_power_model.pkl'):
    joblib.dump(model, filename)

# 6. Główna funkcja
def main(file_path):#, lon, lat):
    MAX_END_DATE = date(2025, 1, 30)  # tymczasowo przyjmujemy jako max dostępne

    today = date.today()
    end_date = min(today - timedelta(days=1), MAX_END_DATE)
    start_date = end_date - timedelta(days=365)

    print("🔍 Najbliższa stacja (lub siatka ERA5):")


    df = load_data(file_path)
    df = extract_features(df)
    X_train, X_test, y_train, y_test = prepare_data(df)
    model = train_models(X_train, y_train, X_test, y_test)

    # Wygeneruj przyszłe dane i prognozę
    last_time = df['timestamp'].max()
    df_future = generate_future_features(start_time=last_time + pd.Timedelta(hours=1))
    forecast_future(model, df_future)

def generate_future_features(start_time, years=25):
    future_dates = pd.date_range(start=start_time, periods=25*365*24, freq='h')
    df_future = pd.DataFrame({'timestamp': future_dates})
    df_future['hour'] = df_future['timestamp'].dt.hour
    df_future['month'] = df_future['timestamp'].dt.month
    df_future['dayofyear'] = df_future['timestamp'].dt.dayofyear
    df_future['weekday'] = df_future['timestamp'].dt.weekday
    df_future["dayssinceepoch"] = [i.days for i in df_future["timestamp"] - datetime(1970, 1, 1)]
    return df_future

def forecast_future(model, df_future, output_csv='prognozaCenaKupna_25_lat.csv'):
    predictions = model.predict(df_future[features])
    df_future['predicted_buyPrice'] = predictions
    df_future = df_future.round(3)
    df_future[['timestamp', 'predicted_buyPrice']].to_csv(output_csv, index=False)
    print(f"Prognoza zapisana do pliku: {output_csv}")


def get_nearest_station(lat, lon):
    url = "https://archive-api.open-meteo.com/v1/era5"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": "2024-01-01",
        "end_date": "2024-01-01",  # jeden dzień wystarczy do identyfikacji stacji
        "hourly": "temperature_2m",
        "timezone": "Europe/Warsaw"
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    meta = response.json().get("generationtime_ms", None)
    station_info = {
        "source": response.json().get("hourly_units", {}),
        "dataset": "ERA5 (reanalysis)",
        "note": "Open-Meteo automatycznie wybiera najbliższą stację lub grid punkt"
    }

    return station_info



def get_weather_history(lat, lon, start_date, end_date, variables=None):
    if variables is None:
        variables = ["temperature_2m", "windspeed_10m", "cloudcover"]

    url = "https://archive-api.open-meteo.com/v1/era5"

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ",".join(variables),
        "timezone": "Europe/Warsaw"
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()

    df = pd.DataFrame({"timestamp": data["hourly"]["time"]})
    for var in variables:
        df[var] = data["hourly"][var]

    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print(f"Użycie: python {sys.argv[0]}.py <dane.csv> ")#<lon> <lat>")
    else:
        main(sys.argv[1])#, sys.argv[2], sys.argv[3])
