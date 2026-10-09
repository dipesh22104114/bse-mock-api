from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal
from app.models import TradeDB
from app.data import INITIAL_TRADES
from app.routes.trades import router as trades_router


Base.metadata.create_all(bind=engine)


# Initialize database with already-pulled trades
db = SessionLocal()

try:

    if db.query(TradeDB).count() == 0:

        for trade in INITIAL_TRADES:

            new_trade = TradeDB(
                trade_id=trade["trade_id"],
                client=trade["client"],
                symbol=trade["symbol"],
                quantity=trade["quantity"],
                price=trade["price"],
                timestamp=trade["timestamp"]
            )

            db.add(new_trade)

        db.commit()

        print("Database initialized with 1000 trades.")

finally:
    db.close()


app = FastAPI(
    title="Mock BSE Trade API",
    description="Mock API for BSE trade data",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(trades_router)


@app.get("/")
def home():
    return {
        "message": "Mock BSE API is running"
    }