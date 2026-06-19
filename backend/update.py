import os
import time
import traceback

import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta

# Anchor to this script's own folder, NOT the current working directory.
# A bare relative path like "Nifty 50.csv" resolves against wherever you
# happen to run `python` from — so running this from the repo root vs
# from inside backend/ would silently read/write two different files.
# This is the same pattern train_stocks.py already uses.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(BASE_DIR, "Nifty 50.csv")

# Yahoo will start throttling/blocking if you hit it 50x back-to-back
# with no delay. This is the most common reason the whole run quietly
# comes back with "No new data available."
REQUEST_DELAY_SECONDS = 1.5
MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 5

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


def fetch_stock_data(symbol, start_date, end_date):

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):

        try:

            data = yf.download(
                symbol,
                start=start_date,
                end=end_date,
                progress=False,
                auto_adjust=True
            )

            # yf.download() can come back empty even with no exception
            # raised (e.g. Yahoo rate-limited the request or returned a
            # malformed/empty JSON payload). Fall back to the Ticker
            # API, which uses a different code path and is often more
            # reliable when download() is being flaky.
            if data.empty:
                ticker = yf.Ticker(symbol)
                data = ticker.history(
                    start=start_date,
                    end=end_date,
                    auto_adjust=True
                )

            if data.empty:
                last_error = "empty response from both download() and Ticker.history()"
                raise ValueError(last_error)

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

            last_error = f"{type(e).__name__}: {e}"

            if attempt < MAX_RETRIES:
                print(
                    f"  Attempt {attempt} failed for {symbol} "
                    f"({last_error}). Retrying in "
                    f"{RETRY_BACKOFF_SECONDS}s..."
                )
                time.sleep(RETRY_BACKOFF_SECONDS)
            else:
                print(
                    f"  Giving up on {symbol} after {MAX_RETRIES} "
                    f"attempts. Last error: {last_error}"
                )
                traceback.print_exc()

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

    # yfinance's `end` is exclusive, so add a day past "today" to make
    # sure today's session (if already available) gets included.
    end_date = today + timedelta(days=1)

    print(f"Fetching data from {start_date.date()} to {today}")

    all_new_data = []
    failed_symbols = []

    for symbol in NIFTY50:

        print(f"Fetching {symbol}")

        stock_df = fetch_stock_data(
            symbol,
            start_date,
            end_date
        )

        if not stock_df.empty:
            all_new_data.append(stock_df)
        else:
            failed_symbols.append(symbol)

        # Be polite to Yahoo's endpoint so we don't get rate-limited
        # partway through the 50-symbol loop.
        time.sleep(REQUEST_DELAY_SECONDS)

    if failed_symbols:
        print(
            f"\nNo data returned for {len(failed_symbols)} symbol(s): "
            f"{', '.join(failed_symbols)}\n"
        )

    if not all_new_data:

        print(
            "No new data available. This usually means Yahoo Finance "
            "is rate-limiting or blocking requests right now rather "
            "than there being no new trading data — re-run in a few "
            "minutes, or check the error messages printed above."
        )
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