import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta

CSV_FILE = "Nifty 50.csv"

NIFTY50 = [
    "ADANIENT.NS",
    "ADANIPORTS.NS",
    "APOLLOHOSP.NS",
    "AXISBANK.NS",
    "BAJAJ-AUTO.NS",
    "BAJAJFINSV.NS",
    "BAJFINANCE.NS",
    "BEL.NS",
    "BHARTIARTL.NS",
    "BPCL.NS",
    "BRITANNIA.NS",
    "CIPLA.NS",
    "COALINDIA.NS",
    "DIVISLAB.NS",
    "DRREDDY.NS",
    "EICHERMOT.NS",
    "GRASIM.NS",
    "HCLTECH.NS",
    "HDFCBANK.NS",
    "HDFCLIFE.NS",
    "HINDALCO.NS",
    "HINDUNILVR.NS",
    "ICICIBANK.NS",
    "INFY.NS",
    "ITC.NS",
    "JSWSTEEL.NS",
    "KOTAKBANK.NS",
    "LT.NS",
    "M&M.NS",
    "MARUTI.NS",
    "NESTLEIND.NS",
    "NTPC.NS",
    "ONGC.NS",
    "POWERGRID.NS",
    "RELIANCE.NS",
    "SBILIFE.NS",
    "SBIN.NS",
    "SHRIRAMFIN.NS",
    "SUNPHARMA.NS",
    "TATACONSUM.NS",
    "TATAPOWER.NS",
    "TATASTEEL.NS",
    "TCS.NS",
    "TECHM.NS",
    "TRENT.NS",
    "ULTRACEMCO.NS",
    "UPL.NS",
    "WIPRO.NS"
]


def load_existing_data():
    try:
        df = pd.read_csv(CSV_FILE)

        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"])

        print(f"Loaded {len(df)} existing rows")
        return df

    except FileNotFoundError:
        print("No existing CSV found.")
        return pd.DataFrame()


def get_last_date(df):

    if df.empty:
        return datetime.today() - timedelta(days=3650)

    return df["Date"].max()


def fetch_stock_data(symbol, start_date):

    try:

        data = yf.download(
            symbol,
            start=start_date,
            progress=False,
            auto_adjust=True
        )

        if data.empty:
            return pd.DataFrame()

        data = data.reset_index()

        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)

        data["Symbol"] = symbol

        columns_needed = [
            "Symbol",
            "Date",
            "Close",
            "High",
            "Low",
            "Open",
            "Volume"
        ]

        return data[columns_needed]

    except Exception as e:

        print(f"Error downloading {symbol}: {e}")
        return pd.DataFrame()


def main():

    existing_df = load_existing_data()

    latest_date = get_last_date(existing_df)

    print(f"Latest date in dataset: {latest_date}")

    start_date = latest_date + timedelta(days=1)

    today = datetime.today().date()

    if start_date.date() > today:

        print("Dataset already up to date.")
        return

    print(f"Fetching data from {start_date.date()}")

    all_new_data = []

    for symbol in NIFTY50:

        print(f"Fetching {symbol}")

        stock_df = fetch_stock_data(
            symbol,
            start_date
        )

        if not stock_df.empty:
            all_new_data.append(stock_df)

    if not all_new_data:

        print("No new data available.")
        return

    new_df = pd.concat(
        all_new_data,
        ignore_index=True
    )

    print(f"Downloaded {len(new_df)} new rows")

    combined_df = pd.concat(
        [existing_df, new_df],
        ignore_index=True
    )

    combined_df["Date"] = pd.to_datetime(
        combined_df["Date"]
    )

    combined_df = combined_df.drop_duplicates(
        subset=["Symbol", "Date"]
    )

    combined_df = combined_df.sort_values(
        ["Symbol", "Date"]
    )

    combined_df.to_csv(
        CSV_FILE,
        index=False
    )

    print(
        f"Dataset updated successfully."
    )

    print(
        f"Total rows: {len(combined_df)}"
    )


if __name__ == "__main__":
    main()