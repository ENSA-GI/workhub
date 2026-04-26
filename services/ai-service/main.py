from fastapi import FastAPI

app = FastAPI(title="WorkHub AI Service")

@app.get("/")
async def root():
    return {"message": "AI Service is running"}
