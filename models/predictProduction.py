import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import xgboost as xgb
import joblib
import matplotlib.pyplot as plt

# 1. Wczytanie danych
def load_data(file_path):
    df = pd.read_csv(file_path, parse_dates=[0])
    df.columns = ['timestamp', 'power']
    return df

# 2. Feature engineering
def extract_features(df):
    df['hour'] = df['timestamp'].dt.hour
    df['month'] = df['timestamp'].dt.month
    df['dayofyear'] = df['timestamp'].dt.dayofyear
    return df

# 3. Przygotowanie danych do modelowania
def prepare_data(df):
    features = ['hour', 'month', 'dayofyear']
    X = df[features]
    y = df['power']
    return train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Trenowanie i wybór najlepszego modelu
def train_models(X_train, y_train, X_test, y_test):
    models = {
        'LinearRegression': LinearRegression(),
        'RandomForest': RandomForestRegressor(n_estimators=100, random_state=42),
        'GradientBoosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
        'XGBoost': xgb.XGBRegressor(n_estimators=100, random_state=42)
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
def main(file_path):
    df = load_data(file_path)
    df = extract_features(df)
    X_train, X_test, y_train, y_test = prepare_data(df)
    model = train_models(X_train, y_train, X_test, y_test)
    # save_model(model)

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
    return df_future

def forecast_future(model, df_future, output_csv='prognoza_25_lat.csv'):
    features = ['hour', 'month', 'dayofyear']
    predictions = model.predict(df_future[features])
    df_future['predicted_power'] = predictions
    df_future = df_future.round(3)
    df_future[['timestamp', 'predicted_power']].to_csv(output_csv, index=False)
    print(f"Prognoza zapisana do pliku: {output_csv}")


if __name__ == '__main__':
    import sys
    if len(sys.argv) != 2:
        print("Użycie: python regression_power_model.py <dane.csv>")
    else:
        main(sys.argv[1])
