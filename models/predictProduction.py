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

# 1. Wczytanie danych
def load_data(file_path):
    df = pd.read_csv(file_path, parse_dates=[0])
    df.columns = ['timestamp', 'power']
    #df["ID"] = f"{df['timestamp'].dt.dayofyear}-{df['timestamp'].dt.hour}"
    return df

# 6. Główna funkcja
def main(file_path, lon, lat):
    MAX_END_DATE = date(2025, 1, 30)  # tymczasowo przyjmujemy jako max dostępne

    today = date.today()
    end_date = min(today - timedelta(days=1), MAX_END_DATE)
    start_date = end_date - timedelta(days=9125)
    df = load_data(file_path)

    ##print("🔍 Najbliższa stacja (lub siatka ERA5):")
    info = get_nearest_station(lat, lon)
    ##print(info)

    df_weather = get_weather_history(
        lat, lon,
        start_date=start_date.isoformat(),
        end_date=end_date.isoformat()
    )

    temp = []
    x = start_date
    counter = 0
    i = 0
    # oktet obniza o 10%, stopien powyzej 15 obniza o 0.4%
    while counter < 9125 * 24:
        temp.append([x, df.iloc[i, 1] * max(0, 1 - (0.4*(max(df_weather.iloc[counter, 1] - 15, 0))) - (0.1 * df_weather.iloc[counter, 2]))])
        i = (i + 1) % df.shape[0]
        counter += 1
        x += timedelta(hours=1)
    df = pd.DataFrame(temp)
    df.columns = ['timestamp', 'predicted_power']
    df.to_csv("prognazowane_25_lat.csv", index=False)
    print(df)






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
    #df["ID"] = f"{df['timestamp'].dt.dayofyear}-{df['timestamp'].dt.hour}"
    return df

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Użycie: python regression_power_model.py <dane.csv> ")#<lon> <lat>")
    else:
        main(sys.argv[1], sys.argv[2], sys.argv[3])
