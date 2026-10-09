import os
from dotenv import load_dotenv

load_dotenv()

DELAY_SECONDS = int(os.getenv("DELAY_SECONDS",5))