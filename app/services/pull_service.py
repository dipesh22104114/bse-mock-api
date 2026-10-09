import asyncio

from app.config import DELAY_SECONDS
from app.data import NEW_TRADES
from app.database import SessionLocal
from app.models import TradeDB
from app.services.websocket_manager import manager


async def pull_trades():

    print("BSE pull started...")

    # Simulate the long BSE API response
    await asyncio.sleep(DELAY_SECONDS)

    print("BSE pull completed.")

    db = SessionLocal()

    try:

        # Add the newly pulled trades
        for trade in NEW_TRADES:

            existing_trade = db.query(TradeDB).filter(
                TradeDB.trade_id == trade["trade_id"]
            ).first()

            if existing_trade is None:

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

        print("New trades saved to database.")

        # Notify the dashboard through WebSocket
        await manager.broadcast({
            "event": "trades_updated",
            "count": len(NEW_TRADES)
        })

        print("Dashboard notified.")

    finally:
        db.close()