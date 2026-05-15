import os
from minio import Minio
from io import BytesIO

class StorageService:
    def __init__(self):
        self.client = Minio(
            os.getenv("MINIO_ENDPOINT", "localhost:9000"),
            access_key=os.getenv("MINIO_ROOT_USER", "minioadmin"),
            secret_key=os.getenv("MINIO_ROOT_PASSWORD", "minioadmin"),
            secure=False
        )
        self.bucket_name = os.getenv("MINIO_BUCKET", "cv-bucket")

    def download_file(self, object_name: str) -> bytes:
        try:
            response = self.client.get_object(self.bucket_name, object_name)
            return response.read()
        finally:
            if 'response' in locals():
                response.close()
                response.release_conn()

storage_service = StorageService()
