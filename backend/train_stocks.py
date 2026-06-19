# %%
import pandas as pd
import numpy as np
from sklearn.metrics import root_mean_squared_error
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score
import sys
import json
import os

# %%
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CSV_PATH = os.path.join(
    BASE_DIR,
    "Nifty 50.csv"
)
stock_data = pd.read_csv(CSV_PATH)

# stock_data = pd.read_csv("Nifty 50.csv")

# %%
stocks = stock_data["Symbol"].unique()
stocks

# %%
def create_features(stock_data):

    stock_data = stock_data.copy()

    stock_data["Date"] = pd.to_datetime(stock_data["Date"])

    stock_data = (
        stock_data
        .sort_values(["Symbol", "Date"])
        .reset_index(drop=True)
    )

    g = stock_data.groupby("Symbol")

    # ==========================
    # PREVIOUS DAY FEATURES
    # ==========================

    stock_data["Prev_Close"] = g["Close"].shift(1)
    stock_data["Prev_High"] = g["High"].shift(1)
    stock_data["Prev_Low"] = g["Low"].shift(1)
    stock_data["Prev_Open"] = g["Open"].shift(1)

    # ==========================
    # SMA
    # ==========================

    for w in [20, 50, 100]:
        stock_data[f"SMA_{w}"] = (
            g["Close"]
            .transform(lambda x: x.rolling(w).mean())
        )

    # ==========================
    # RSI 14
    # ==========================

    delta = g["Close"].diff()

    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.groupby(stock_data["Symbol"]).transform(
        lambda x: x.rolling(14).mean()
    )

    avg_loss = loss.groupby(stock_data["Symbol"]).transform(
        lambda x: x.rolling(14).mean()
    )

    rs = avg_gain / avg_loss

    stock_data["RSI_14"] = (
        100 - (100 / (1 + rs))
    )

    # ==========================
    # PRICE ACTION
    # ==========================

    stock_data["High_Low_Spread"] = (
        stock_data["High"]
        - stock_data["Low"]
    )

    stock_data["Daily_Return"] = (
        stock_data["Close"]
        - stock_data["Prev_Close"]
    ) / stock_data["Prev_Close"]

    # ==========================
    # EMA
    # ==========================

    for span in [9, 12, 20, 26, 50]:

        stock_data[f"EMA_{span}"] = (
            g["Close"]
            .transform(
                lambda x:
                x.ewm(
                    span=span,
                    adjust=False
                ).mean()
            )
        )

    stock_data["Close_vs_EMA9"] = (
        (
            stock_data["Close"]
            - stock_data["EMA_9"]
        )
        / stock_data["EMA_9"]
    ) * 100

    stock_data["Close_vs_EMA20"] = (
        (
            stock_data["Close"]
            - stock_data["EMA_20"]
        )
        / stock_data["EMA_20"]
    ) * 100

    # ==========================
    # MACD
    # ==========================

    stock_data["MACD"] = (
        stock_data["EMA_12"]
        - stock_data["EMA_26"]
    )

    stock_data["MACD_Signal"] = (
        stock_data
        .groupby("Symbol")["MACD"]
        .transform(
            lambda x:
            x.ewm(
                span=9,
                adjust=False
            ).mean()
        )
    )

    stock_data["MACD_Histogram"] = (
        stock_data["MACD"]
        - stock_data["MACD_Signal"]
    )

    # ==========================
    # BOLLINGER BANDS
    # ==========================

    bb_mid = (
        g["Close"]
        .transform(
            lambda x:
            x.rolling(20).mean()
        )
    )

    bb_std = (
        g["Close"]
        .transform(
            lambda x:
            x.rolling(20).std()
        )
    )

    stock_data["BB_Upper"] = bb_mid + (2 * bb_std)
    stock_data["BB_Lower"] = bb_mid - (2 * bb_std)

    stock_data["BB_Width"] = (
        stock_data["BB_Upper"]
        - stock_data["BB_Lower"]
    ) / bb_mid

    stock_data["BB_Percent"] = (
        (
            stock_data["Close"]
            - stock_data["BB_Lower"]
        )
        /
        (
            stock_data["BB_Upper"]
            - stock_data["BB_Lower"]
        )
    )

    # ==========================
    # ATR
    # ==========================

    prev_close = g["Close"].shift(1)

    tr = pd.concat(
        [
            stock_data["High"]
            - stock_data["Low"],

            (
                stock_data["High"]
                - prev_close
            ).abs(),

            (
                stock_data["Low"]
                - prev_close
            ).abs()
        ],
        axis=1
    ).max(axis=1)

    stock_data["ATR_14"] = (
        tr.groupby(stock_data["Symbol"])
        .transform(
            lambda x:
            x.ewm(
                span=14,
                adjust=False
            ).mean()
        )
    )

    stock_data["ATR_Percent"] = (
        stock_data["ATR_14"]
        / stock_data["Close"]
    ) * 100

    # ==========================
    # VOLUME
    # ==========================

    stock_data["Volume_MA10"] = (
        g["Volume"]
        .transform(
            lambda x:
            x.rolling(10).mean()
        )
    )

    stock_data["Volume_Ratio"] = (
        stock_data["Volume"]
        / stock_data["Volume_MA10"]
    )

    # ==========================
    # STOCHASTIC
    # ==========================

    low_14 = (
        g["Low"]
        .transform(
            lambda x:
            x.rolling(14).min()
        )
    )

    high_14 = (
        g["High"]
        .transform(
            lambda x:
            x.rolling(14).max()
        )
    )

    stock_data["Stoch_K"] = (
        (
            stock_data["Close"]
            - low_14
        )
        /
        (
            high_14
            - low_14
        )
    ) * 100

    stock_data["Stoch_D"] = (
        stock_data
        .groupby("Symbol")["Stoch_K"]
        .transform(
            lambda x:
            x.rolling(3).mean()
        )
    )

    stock_data["Stoch_Cross"] = np.where(
        stock_data["Stoch_K"]
        >
        stock_data["Stoch_D"],
        1,
        -1
    )

    # ==========================
    # WILLIAMS %R
    # ==========================

    stock_data["Williams_R"] = (
        (
            high_14
            - stock_data["Close"]
        )
        /
        (
            high_14
            - low_14
        )
    ) * (-100)

    # ==========================
    # CCI
    # ==========================

    typical_price = (
        stock_data["High"]
        + stock_data["Low"]
        + stock_data["Close"]
    ) / 3

    cci_ma = (
        typical_price
        .groupby(stock_data["Symbol"])
        .transform(
            lambda x:
            x.rolling(20).mean()
        )
    )

    cci_std = (
        typical_price
        .groupby(stock_data["Symbol"])
        .transform(
            lambda x:
            x.rolling(20).std()
        )
    )

    stock_data["CCI_20"] = (
        (
            typical_price
            - cci_ma
        )
        /
        (
            0.015
            * cci_std
        )
    )

    # ==========================
    # CANDLE FEATURES
    # ==========================

    stock_data["Body_Size"] = (
        stock_data["Close"]
        - stock_data["Open"]
    ).abs()

    stock_data["Upper_Wick"] = (
        stock_data["High"]
        -
        np.maximum(
            stock_data["Open"],
            stock_data["Close"]
        )
    )

    stock_data["Lower_Wick"] = (
        np.minimum(
            stock_data["Open"],
            stock_data["Close"]
        )
        -
        stock_data["Low"]
    )

    stock_data["Is_Bullish"] = (
        stock_data["Close"]
        >
        stock_data["Open"]
    ).astype(int)

    # ==========================
    # GAP FEATURES
    # ==========================

    stock_data["Gap"] = (
        stock_data["Open"]
        - stock_data["Prev_Close"]
    )

    stock_data["Gap_Pct"] = (
        stock_data["Gap"]
        / stock_data["Prev_Close"]
    ) * 100

    # ==========================
    # CALENDAR
    # ==========================

    stock_data["Day_of_Week"] = (
        stock_data["Date"].dt.dayofweek
    )

    stock_data["Month"] = (
        stock_data["Date"].dt.month
    )

    stock_data["Quarter"] = (
        stock_data["Date"].dt.quarter
    )

    # ==========================
    # RSI DERIVATIVES
    # ==========================

    stock_data["RSI_Change"] = (
        stock_data["RSI_14"].diff()
    )

    stock_data["RSI_MA5"] = (
        stock_data
        .groupby("Symbol")["RSI_14"]
        .transform(
            lambda x:
            x.rolling(5).mean()
        )
    )

    # ==========================
    # LAGS
    # ==========================

    stock_data["Close_Lag1"] = g["Close"].shift(1)
    stock_data["Close_Lag2"] = g["Close"].shift(2)
    stock_data["Close_Lag3"] = g["Close"].shift(3)

    stock_data["Return_Lag1"] = g["Daily_Return"].shift(1)
    stock_data["Return_Lag2"] = g["Daily_Return"].shift(2)
    stock_data["Return_Lag3"] = g["Daily_Return"].shift(3)

    # ==========================
    # TARGETS
    # ==========================

    stock_data["Target_Return"] = (
        g["Daily_Return"].shift(-1)
    )

    stock_data["Tomorrow_Close"] = (
        g["Close"].shift(-1)
    )

    # =====================================
# ROLLING STATISTICS
# =====================================

    for w in [5, 10, 20]:

        stock_data[f"Rolling_Volatility_{w}"] = (
            stock_data
            .groupby("Symbol")["Daily_Return"]
            .transform(
                lambda x: x.rolling(w).std()
            )
        )

        stock_data[f"Rolling_Mean_Return_{w}"] = (
            stock_data
            .groupby("Symbol")["Daily_Return"]
            .transform(
                lambda x: x.rolling(w).mean()
            )
        )

        stock_data[f"Rolling_Max_{w}"] = (
            stock_data
            .groupby("Symbol")["Close"]
            .transform(
                lambda x: x.rolling(w).max()
            )
        )

        stock_data[f"Rolling_Min_{w}"] = (
            stock_data
            .groupby("Symbol")["Close"]
            .transform(
                lambda x: x.rolling(w).min()
            )
        )

        stock_data[f"Close_vs_High_{w}"] = (
            (
                stock_data["Close"]
                - stock_data[f"Rolling_Max_{w}"]
            )
            /
            stock_data[f"Rolling_Max_{w}"]
        ) * 100

        stock_data[f"Close_vs_Low_{w}"] = (
            (
                stock_data["Close"]
                - stock_data[f"Rolling_Min_{w}"]
            )
            /
            stock_data[f"Rolling_Min_{w}"]
        ) * 100


    # =====================================
    # EXTRA CANDLESTICK FEATURES
    # =====================================

    stock_data["Body_Pct"] = (
        stock_data["Body_Size"]
        / stock_data["Close"]
    ) * 100

    stock_data["Upper_Wick_Pct"] = (
        stock_data["Upper_Wick"]
        / stock_data["Close"]
    ) * 100

    stock_data["Lower_Wick_Pct"] = (
        stock_data["Lower_Wick"]
        / stock_data["Close"]
    ) * 100

    stock_data["Intraday_Position"] = (
        (
            stock_data["Close"]
            - stock_data["Low"]
        )
        /
        (
            stock_data["High"]
            - stock_data["Low"]
        )
    )

    stock_data["High_Low_Spread_Pct"] = (
        (
            stock_data["High"]
            - stock_data["Low"]
        )
        /
        stock_data["Close"]
    ) * 100


    # =====================================
    # GAP FLAGS
    # =====================================

    stock_data["Gap_Up"] = (
        stock_data["Gap"] > 0
    ).astype(int)

    stock_data["Gap_Down"] = (
        stock_data["Gap"] < 0
    ).astype(int)


    # =====================================
    # EXTRA CALENDAR FEATURES
    # =====================================

    stock_data["Week_of_Year"] = (
        stock_data["Date"]
        .dt.isocalendar()
        .week
        .astype(int)
    )

    stock_data["Is_Month_Start"] = (
        stock_data["Date"]
        .dt.is_month_start
        .astype(int)
    )

    stock_data["Is_Month_End"] = (
        stock_data["Date"]
        .dt.is_month_end
        .astype(int)
    )


    # =====================================
    # RSI FLAGS
    # =====================================

    stock_data["RSI_Overbought"] = (
        stock_data["RSI_14"] > 70
    ).astype(int)

    stock_data["RSI_Oversold"] = (
        stock_data["RSI_14"] < 30
    ).astype(int)


    return stock_data

prediction={}


# %%
for stock in stocks:
    stock_df = stock_data[stock_data["Symbol"]==stock]
    stock_df["Date"] = pd.to_datetime(stock_df["Date"])
    stock_df = stock_df.sort_values("Date")
    # print("\n", stock)
    # print(stock_df[["Date", "Close"]].tail(5))
    stock_df = create_features(stock_df)
    prediction_row = (stock_df.groupby("Symbol").tail(1).copy())
    stock_df=stock_df.dropna()
    #Now the individual csv file is ready
    feature_cols = [
        col
        for col in stock_df.columns
        if col not in [
            "Symbol",
            "Date",
            "Target_Return",
            "Tomorrow_Close"
        ]
    ]
    x = stock_df[feature_cols]
    y = stock_df["Tomorrow_Close"]

    split=int(len(x)*0.8)
    x_train=x[:split]
    x_test=x[split:]
    y_train=y[:split]
    y_test=y[split:]

    x_scaler=StandardScaler()
    x_train_scaled=x_scaler.fit_transform(x_train)
    x_test_scaled=x_scaler.transform(x_test)

    y_scaler = StandardScaler()
    y_train_scaled=y_scaler.fit_transform(y_train.to_numpy().reshape(-1,1)).ravel()
    y_test_scaled=y_scaler.transform(y_test.to_numpy().reshape(-1,1)).ravel()


    model = MLPRegressor(hidden_layer_sizes=[256, 128, 64, 32, 16],early_stopping=True,verbose=False,random_state=42)
    model.fit(x_train_scaled,y_train_scaled)

    pred_scaled= model.predict(x_test_scaled)
    pred=y_scaler.inverse_transform(pred_scaled.reshape(-1,1)).ravel()

    latest_row = prediction_row[feature_cols]
    latest_scaled=x_scaler.transform(latest_row)
    pred_scaled=model.predict(latest_scaled)
    pred_price=y_scaler.inverse_transform(pred_scaled.reshape(-1,1))[0][0]
    rmse = root_mean_squared_error(y_test,pred)

    R2 = r2_score(y_test,pred)
    Direction_Accuracy = np.mean(
    np.sign(pred) == np.sign(y_test)
    )

    current_price = float(prediction_row.iloc[-1]["Close"])

    expected_return = (
        (pred_price - current_price)
        / current_price
    ) * 100

    
    if expected_return >= 2:
        signal = "STRONG BUY"

    elif expected_return >= 0.5:
        signal = "BUY"

    elif expected_return > -0.5:
        signal = "HOLD"

    elif expected_return > -2:
        signal = "SELL"

    else:
        signal = "STRONG SELL"

    if signal == "STRONG BUY":
        analysis = "The model identifies strong bullish momentum supported by recent market trends and technical indicators. Current conditions suggest a high probability of continued upward movement."

    elif signal == "BUY":
        analysis = "The model predicts upward movement based on recent price action and momentum indicators. Current market conditions suggest positive short-term potential with a bullish outlook."

    elif signal == "HOLD":
        analysis = "The model indicates neutral market conditions with no strong directional bias. Current price action suggests monitoring the stock for clearer trend confirmation before taking action."

    elif signal == "SELL":
        analysis = "The model predicts downward movement based on recent price action and momentum indicators. Current market conditions suggest weakness and a bearish short-term outlook."

    else:  # STRONG SELL
        analysis = "The model detects strong bearish momentum supported by recent market trends and technical indicators. Current conditions indicate elevated downside risk in the near term."

    prediction[stock]={
        "Symbol": stock,
        "CurrentPrice": round(current_price, 2),
        "PredictedPrice": round(float(pred_price), 2),
        "ExpectedReturn": round(float(expected_return), 2),
        "rmse":rmse,
        "r2":R2,
        "DirectionAccuracy":round(float(Direction_Accuracy)),
        "Confidence":round((R2*100),2),
        "Signal":signal,
        "Analysis":analysis
    }

with open("predictions.json", "w") as f:
    json.dump(
        prediction,
        f,
        indent=4
    )

print("predictions.json generated successfully")



