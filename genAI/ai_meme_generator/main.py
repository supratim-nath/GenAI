from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
import io

app = FastAPI(title="AI Meme Generator")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static directory to serve HTML, CSS, JS
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

API_KEY = "AIzaSyAdNS6lsvEO7Ne8VLZShYYfmuInQ1GJi5k"

@app.post("/generate")
async def generate_meme(
    image: UploadFile = File(...),
    humor_style: str = Form(...)
):
    try:
        # Read the uploaded image
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))
        
        # Configure Gemini
        genai.configure(api_key=API_KEY)
        
        # We discovered gemini-2.5-flash works for this key
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"Analyze this image and generate 5 short meme captions suitable for social media. Humor style: {humor_style}. Keep them funny and concise. Format the output clearly."
        
        response = model.generate_content([prompt, img])
        
        return {"success": True, "captions": response.text}
        
    except Exception as e:
        print(f"Error during generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
