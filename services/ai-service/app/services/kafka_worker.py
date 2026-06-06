import asyncio
import json
import os
import logging
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from .storage_service import storage_service
from .ai_analyzer import ai_analyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPIC_INPUT = "workhub.recruitment.events.v1"
TOPIC_OUTPUT = "workhub.recruitment.analysis.v1"

async def process_message(msg, producer):
    try:
        data = json.loads(msg.value.decode('utf-8'))
        application_id = data.get("applicationId")
        cv_url = data.get("cvUrl")
        job_description = data.get("jobDescription", "")

        # Nettoyage de l'URL pour MinIO
        if cv_url and cv_url.startswith("minio://"):
            # Format attendu: minio://cv-bucket/filename.pdf
            # On récupère tout ce qui est après le dernier '/'
            cv_url = cv_url.split("/")[-1]
        elif cv_url and "/" in cv_url:
            # Si c'est format bucket/filename
            cv_url = cv_url.split("/")[-1]

        logger.info(f"Traitement de la candidature {application_id}...")

        # 1. Télécharger le CV
        # Le cv_url est généralement le nom de l'objet dans le bucket
        cv_bytes = storage_service.download_file(cv_url)
        
        # 2. Extraire le texte
        cv_text = ai_analyzer.extract_text_from_pdf(cv_bytes)

        # 3. Analyser avec Groq
        result = ai_analyzer.analyze_application(cv_text, job_description)

        # 4. Envoyer le résultat sur Kafka
        output_event = {
            "applicationId": str(application_id),
            "score": result.get("score"),
            "summary": result.get("summary")
        }
        
        await producer.send_and_wait(TOPIC_OUTPUT, json.dumps(output_event).encode('utf-8'))
        logger.info(f"Analyse terminée pour {application_id}. Score: {result.get('score')}")

    except Exception as e:
        logger.error(f"Erreur lors du traitement : {e}")

async def start_kafka_worker():
    consumer = AIOKafkaConsumer(
        TOPIC_INPUT,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="ai-service-group",
        auto_offset_reset='earliest'
    )
    
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)

    # Retry loop for connection
    connected = False
    while not connected:
        try:
            await consumer.start()
            await producer.start()
            connected = True
        except Exception as e:
            logger.error(f"Échec de connexion Kafka (le sujet n'existe peut-être pas encore) : {e}. Nouvel essai dans 5s...")
            await asyncio.sleep(5)
    
    try:
        logger.info("AI Kafka Worker démarré et prêt !")
        async for msg in consumer:
            await process_message(msg, producer)
    finally:
        await consumer.stop()
        await producer.stop()
