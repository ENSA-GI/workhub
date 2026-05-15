import os
import json
from groq import Groq
from PyPDF2 import PdfReader
from io import BytesIO

class AIAnalyzer:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY", "VOTRE_CLE_GROQ_ICI"))
        self.model = "llama-3.3-70b-versatile"

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        reader = PdfReader(BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text

    def analyze_application(self, cv_text: str, job_description: str):
        prompt = f"""
        En tant qu'expert en recrutement, analyse le CV suivant par rapport à la description du poste.
        
        DESCRIPTION DU POSTE:
        {job_description}
        
        CV DU CANDIDAT:
        {cv_text}
        
        Réponds UNIQUEMENT au format JSON suivant :
        {{
            "score": <un nombre entre 0 et 100 représentant le matching>,
            "summary": "<un résumé de 3 phrases maximum sur les points forts et faibles du candidat>"
        }}
        """
        
        chat_completion = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.model,
            response_format={"type": "json_object"}
        )
        
        return json.loads(chat_completion.choices[0].message.content)

ai_analyzer = AIAnalyzer()
