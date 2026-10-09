import asyncio

from fastapi import APIRouter
from fastapi import WebSocket, WebSocketDisconnect

from app.database import SessionLocal
from app.models import TradeDB

from app.services.pull_service import pull_trades
from app.services.websocket_manager import manager


router = APIRouter()


@router.get("/getTrades")
async def get_trades():

    db = SessionLocal()

    try:

        trades = db.query(TradeDB).all()

        return {
            "status": "success",
            "count": len(trades),
            "trades": trades
        }

    finally:

        db.close()


@router.post("/start-pull")
async def start_pull():

    asyncio.create_task(pull_trades())

    return {
        "status": "started",
        "message": "Trade pull started"
    }


@router.websocket("/ws/trades")
async def websocket_endpoint(websocket: WebSocket):

    await manager.connect(websocket)

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)