FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY shared ./shared
COPY scripts/start-render.sh ./start-render.sh
RUN chmod +x ./start-render.sh

ENV PYTHONPATH=/app
# Render injects $PORT; default to 8000 for local `docker run`
ENV PORT=8000
EXPOSE 8000

# Runs the Celery worker (with embedded beat) + the FastAPI server together
# so both share the persistent /data/exports disk.
CMD ["./start-render.sh"]
