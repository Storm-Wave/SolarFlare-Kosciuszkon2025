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
from datetime import datetime, timedelta, date

features = ['hour', 'month', 'dayofyear']#, "temperature_2m", "windspeed_10m", "cloudcover"]

def load_data(file_path):
    df = pd.read_csv(file_path, parse_dates=[0])
    df.columns = ['timestamp', 'power']
    return df

def extract_features(df):
    df['hour'] = df['timestamp'].dt.hour
    df['month'] = df['timestamp'].dt.month
    df['dayofyear'] = df['timestamp'].dt.dayofyear
    return df

def prepare_data(df):
    features = ['hour', 'month', 'dayofyear']
    X = df[features]
    y = df['power']
    return train_test_split(X, y, test_size=0.2, random_state=42)

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

    return best_model


def main(file_path):#, lon, lat):

    MAX_END_DATE = date(2025, 1, 30)  # tymczasowo przyjmujemy jako max dostępne
    today = date.today()
    df = load_data(file_path)
    df = extract_features(df)
    X_train, X_test, y_train, y_test = prepare_data(df)
    model = train_models(X_train, y_train, X_test, y_test)
    last_time = df['timestamp'].max()
    df_future = generate_future_features(start_time=last_time + pd.Timedelta(hours=1))
    forecast_future(model, df_future)

'''
    # Parametry czasowe
    MAX_END_DATE = date(2025, 1, 30)
    today = date.today()
    end_date = min(today - timedelta(days=1), MAX_END_DATE)
    start_date = end_date - timedelta(days=9125)

    # Pobranie danych
    info = get_nearest_station(lat, lon)
    df_weather = get_weather_history(
        lat, lon,
        start_date=start_date.isoformat(),
        end_date=end_date.isoformat()
    )

    # Konwersja danych do NumPy
    weather_temp = df_weather.iloc[:9125*24, 1].to_numpy()
    weather_clouds = df_weather.iloc[:9125*24, 2].to_numpy()
    base_power_cycle = np.resize(df.iloc[:, 1].to_numpy(), 9125 * 24)  # cykliczne dopasowanie długości

    # Obliczenia wektorowe
    temp_correction = 0.4 * np.maximum(weather_temp - 15, 0)
    cloud_correction = 0.1 * weather_clouds
    multiplier = np.clip(1 - temp_correction - cloud_correction, 0, None)

    predicted_power = base_power_cycle * multiplier

    # Generowanie znaczników czasu
    timestamps = pd.date_range(start=MAX_END_DATE, periods=9125*24, freq='h')

    # Tworzenie DataFrame i zapis do pliku
    df_result = pd.DataFrame({
        'timestamp': timestamps,
        'predicted_power': predicted_power
    })

    df_result.to_csv("prognoza_25_lat.csv", index=False)
    '''

'''
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
'''

'''
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
'''


def generate_future_features(start_time, years=25):
    future_dates = pd.date_range(start=start_time, periods=25*365*24, freq='h')
    df_future = pd.DataFrame({'timestamp': future_dates})
    df_future['hour'] = df_future['timestamp'].dt.hour
    df_future['month'] = df_future['timestamp'].dt.month
    df_future['dayofyear'] = df_future['timestamp'].dt.dayofyear
    return df_future

def forecast_future(model, df_future, output_csv='prognoza_25_lat.csv'):
    predictions = model.predict(df_future[features])
    df_future['predicted_power'] = predictions
    df_future = df_future.round(3)
    df_future[['timestamp', 'predicted_power']].to_csv(output_csv, index=False)
    print(f"Prognoza zapisana do pliku: {output_csv}")
    df_future.to_csv(output_csv, index=False)


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Użycie: python regression_power_model.py <dane.csv> ")#<lon> <lat>")
    else:
        main(sys.argv[1])#, sys.argv[2], sys.argv[3])
