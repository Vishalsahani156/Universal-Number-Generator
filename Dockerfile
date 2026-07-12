FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY shared ./shared

ENV PYTHONPATH=/app
# Render injects $PORT; default to 8000 for local `docker run`
ENV PORT=8000
EXPOSE 8000

# Shell form so $PORT is expanded at runtime
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
