import asyncio
from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv() # Charge les variables du fichier .env

from app.services.kafka_worker import start_kafka_worker

app = FastAPI(title="WorkHub AI Service")

@app.on_event("startup")
async def startup_event():
    # Lancer le worker Kafka en tâche de fond
    asyncio.create_task(start_kafka_worker())

@app.get("/")
async def root():
    return {"message": "AI Service is running and listening to Kafka"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
