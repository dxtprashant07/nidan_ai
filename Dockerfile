FROM python:3.11-slim

RUN useradd -m -u 1000 user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    TF_CPP_MIN_LOG_LEVEL=2 \
    PORT=7860

WORKDIR $HOME/app

COPY --chown=user backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

ADD --chown=user https://media.githubusercontent.com/media/dxtprashant07/nidan_ai/main/best_retina_vessel_segmentation_model.keras ./best_retina_vessel_segmentation_model.keras
ADD --chown=user https://media.githubusercontent.com/media/dxtprashant07/nidan_ai/main/new_best_brain_tumor_model.keras ./new_best_brain_tumor_model.keras
ADD --chown=user https://media.githubusercontent.com/media/dxtprashant07/nidan_ai/main/retina_vessel_segmentation_final_latest.keras ./retina_vessel_segmentation_final_latest.keras

COPY --chown=user backend backend

USER user

EXPOSE 7860

CMD ["uvicorn", "main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "7860"]
