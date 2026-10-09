from datetime import datetime, timedelta
import random


symbols = [
    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "ICICIBANK",
    "SBIN",
    "ITC",
    "LT",
    "AXISBANK",
    "WIPRO"
]

clients = [
    "CLIENT001",
    "CLIENT002",
    "CLIENT003",
    "CLIENT004",
    "CLIENT005",
    "CLIENT006",
    "CLIENT007",
    "CLIENT008",
    "CLIENT009",
    "CLIENT010"
]


def generate_trades(count=3000):
    trades = []

    start_time = datetime.now()

    for i in range(1, count + 1):

        trade = {
            "trade_id": f"T{i:06d}",
            "client": random.choice(clients),
            "symbol": random.choice(symbols),
            "quantity": random.randint(1, 1000),
            "price": round(random.uniform(100, 5000), 2),
            "timestamp": start_time + timedelta(seconds=i)
        }

        trades.append(trade)

    return trades


# Generate 3000 mock BSE trades
TRADES = generate_trades(3000)


# Trades already available before the new pull
INITIAL_TRADES = TRADES[:1000]


# Trades that arrive after the delayed BSE pull
NEW_TRADES = TRADES[1000:]