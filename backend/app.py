from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import re, string, os, pickle, time

from huggingface_hub import hf_hub_download, snapshot_download
import os

MODEL_REPO = "florenciaolga/sentiment-analysis-models"
MODEL_DIR = os.environ.get("MODEL_DIR", "./models")
HF_TOKEN = os.environ.get("HF_TOKEN")

def _get_file(filename):
    """Download a single file from the HF repo the first time it's needed."""
    return hf_hub_download(repo_id=MODEL_REPO, filename=filename, local_dir=MODEL_DIR, token=HF_TOKEN)

def _get_folder(folder_name):
    """Download only one subfolder from the HF repo the first time it's needed."""
    snapshot_download(
        repo_id=MODEL_REPO,
        local_dir=MODEL_DIR,
        token=HF_TOKEN,
        allow_patterns=[f"{folder_name}/*"],
    )
    return os.path.join(MODEL_DIR, folder_name)

app = Flask(__name__)
CORS(app)

# preprocessing
try:
    from nltk.corpus import stopwords
    import nltk; nltk.download('stopwords', quiet=True)
    STOPWORDS = set(stopwords.words('indonesian'))
except:
    STOPWORDS = set()

NEGASI = {'tidak','kurang','bukan','belum','jangan','tdk','gk','enggak','ga','gak'}
STOPWORDS_FINAL = STOPWORDS - NEGASI

try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    _stemmer = StemmerFactory().create_stemmer()
    def _stem(w): return _stemmer.stem(w)
except:
    def _stem(w): return w

def _clean(text):
    text = text.lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[@#]\w+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\d+', '', text)
    return re.sub(r'\s+', ' ', text).strip()

def _tokenize(text):
    return [w for w in _clean(text).split() if w not in STOPWORDS_FINAL]

def prep_base(text):
    return ' '.join(_tokenize(text))

def prep_stemmed(text):
    return ' '.join([_stem(w) for w in _tokenize(text)])

def prep_lstm(text):
    text = text.lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'#\w+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\d+', '', text)
    return re.sub(r'\s+', ' ', text).strip()

# metrics diambil daari google colab
METRICS = {
    "tfidf_lr": {
        "accuracy": 0.920370,
        "precision": {"Negative": 0.892206, "Positive": 0.955975, "macro avg": 0.924090, "weighted avg": 0.922968},
        "recall":    {"Negative": 0.962433, "Positive": 0.875240, "macro avg": 0.918836, "weighted avg": 0.920370},
        "f1":        {"Negative": 0.925990, "Positive": 0.913828, "macro avg": 0.919909, "weighted avg": 0.920123},
        "support":   {"Negative": 559, "Positive": 521, "macro avg": 1080, "weighted avg": 1080},
    },
    "tfidf_svm": {
        "accuracy": 0.936111,
        "precision": {"Negative": 0.911074, "Positive": 0.966942, "macro avg": 0.939008, "weighted avg": 0.938025},
        "recall":    {"Negative": 0.971377, "Positive": 0.898273, "macro avg": 0.934825, "weighted avg": 0.936111},
        "f1":        {"Negative": 0.940260, "Positive": 0.931343, "macro avg": 0.935802, "weighted avg": 0.935958},
        "support":   {"Negative": 559, "Positive": 521, "macro avg": 1080, "weighted avg": 1080},
    },
    "fasttext_lr": {
        "accuracy": 0.9269,
        "precision": {"Negative": 0.94, "Positive": 0.91, "macro avg": 0.93, "weighted avg": 0.93},
        "recall":    {"Negative": 0.92, "Positive": 0.94, "macro avg": 0.93, "weighted avg": 0.93},
        "f1":        {"Negative": 0.93, "Positive": 0.92, "macro avg": 0.93, "weighted avg": 0.93},
        "support":   {"Negative": 564, "Positive": 516, "macro avg": 1080, "weighted avg": 1080},
    },
    "fasttext_svm": {
        "accuracy": 0.935,
        "precision": {"Negative": 0.94, "Positive": 0.91, "macro avg": 0.93, "weighted avg": 0.93},
        "recall":    {"Negative": 0.92, "Positive": 0.94, "macro avg": 0.93, "weighted avg": 0.93},
        "f1":        {"Negative": 0.93, "Positive": 0.92, "macro avg": 0.93, "weighted avg": 0.93},
        "support":   {"Negative": 564, "Positive": 516, "macro avg": 1080, "weighted avg": 1080},
    },
    "lstm": {
        "accuracy": 0.9350,
        "precision": {"Negative": 0.9619, "Positive": 0.9063, "macro avg": 0.9360, "weighted avg": 0.9350},
        "recall":    {"Negative": 0.9068, "Positive": 0.9618, "macro avg": 0.9346, "weighted avg": 0.9333},
        "f1":        {"Negative": 0.9335, "Positive": 0.9332, "macro avg": 0.9350, "weighted avg": 0.9334},
        "support":   {"Negative": 557, "Positive": 523, "macro avg": 1080, "weighted avg": 1080},
    },
    "indobert": {
        "accuracy": 0.9750,
        "precision": {"Negative": 0.98, "Positive": 0.97, "macro avg": 0.97, "weighted avg": 0.97},
        "recall":    {"Negative": 0.98, "Positive": 0.97, "macro avg": 0.97, "weighted avg": 0.97},
        "f1":        {"Negative": 0.98, "Positive": 0.97, "macro avg": 0.97, "weighted avg": 0.97},
        "support":   {"Negative": 564, "Positive": 516, "macro avg": 1080, "weighted avg": 1080},
    },
}

tfidf_vec     = None
tfidf_lr      = None
tfidf_svm     = None
ft_model      = None
ft_lr         = None
ft_svm        = None
lstm_model    = None
lstm_tokenizer = None
bert_model    = None
bert_tokenizer = None

def get_fasttext_vec(text, model, dim=100):
    words = text.split()
    vecs  = []
    for w in words:
        try:
            vecs.append(model.get_word_vector(w))
        except AttributeError:
            if w in model.wv:
                vecs.append(model.wv[w])
    if vecs:
        return np.mean(vecs, axis=0)
    try:
        return model.get_sentence_vector(text)
    except Exception:
        return np.zeros(dim)

#buat railway

def ensure_tfidf():
    global tfidf_vec, tfidf_lr, tfidf_svm
    if tfidf_vec is not None and tfidf_lr is not None and tfidf_svm is not None:
        return
    with open(_get_file('tfidf_vectorizer.pkl'), 'rb') as f:
        tfidf_vec = pickle.load(f)
    with open(_get_file('tfidf_lr_model.pkl'), 'rb') as f:
        tfidf_lr = pickle.load(f)
    with open(_get_file('tfidf_svm_model.pkl'), 'rb') as f:
        tfidf_svm = pickle.load(f)
    print("✓ TF-IDF models loaded.")

def ensure_fasttext_base():
    global ft_model
    if ft_model is not None:
        return
    path = _get_file('fasttext_model.bin')
    try:
        import fasttext
        ft_model = fasttext.load_model(path)
        print("✓ FastText .bin loaded via fasttext library.")
    except ImportError:
        from gensim.models.fasttext import load_facebook_model
        ft_model = load_facebook_model(path)
        print("✓ FastText .bin loaded via gensim.")

def ensure_fasttext_lr():
    global ft_lr
    ensure_fasttext_base()
    if ft_lr is not None:
        return
    with open(_get_file('fasttext_lr_model.pkl'), 'rb') as f:
        ft_lr = pickle.load(f)
    print("✓ FastText LR classifier loaded.")

def ensure_fasttext_svm():
    global ft_svm
    ensure_fasttext_base()
    if ft_svm is not None:
        return
    with open(_get_file('fasttext_svm_model.pkl'), 'rb') as f:
        ft_svm = pickle.load(f)
    print("✓ FastText SVM classifier loaded.")

def ensure_lstm():
    global lstm_model, lstm_tokenizer
    if lstm_model is not None and lstm_tokenizer is not None:
        return
    from tensorflow.keras.models import load_model as keras_load
    lstm_model = keras_load(_get_file('lstm_model.keras'))
    with open(_get_file('lstm_tokenizer.pkl'), 'rb') as f:
        lstm_tokenizer = pickle.load(f)
    print("✓ LSTM model + tokenizer loaded.")

def ensure_indobert():
    global bert_model, bert_tokenizer
    if bert_model is not None and bert_tokenizer is not None:
        return
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    bert_dir = _get_folder('indobert_model')
    bert_tokenizer = AutoTokenizer.from_pretrained(bert_dir)
    bert_model     = AutoModelForSequenceClassification.from_pretrained(bert_dir)
    bert_model.eval()
    print("✓ IndoBERT model loaded.")


# ─── API Routes ───────────────────────────────────────────────────────────────
@app.route('/api/predict', methods=['POST'])
def predict():
    data  = request.json or {}
    text  = data.get('text', '').strip()
    model = data.get('model', 'tfidf_lr')

    if not text:
        return jsonify({'error': 'Text is required'}), 400

    start = time.time()

    try:
        if model == 'tfidf_lr':
            ensure_tfidf()
            cleaned = prep_base(text)
            vec     = tfidf_vec.transform([cleaned])
            pred    = int(tfidf_lr.predict(vec)[0])
            conf    = float(tfidf_lr.predict_proba(vec)[0][pred])

        elif model == 'tfidf_svm':
            ensure_tfidf()
            cleaned = prep_base(text)
            vec     = tfidf_vec.transform([cleaned])
            pred    = int(tfidf_svm.predict(vec)[0])
            try:
                conf = float(tfidf_svm.predict_proba(vec)[0][pred])
            except (AttributeError, Exception):
                import math
                score = float(tfidf_svm.decision_function(vec)[0])
                conf  = 1 / (1 + math.exp(-abs(score)))

        elif model == 'fasttext_lr':
            ensure_fasttext_lr()
            cleaned = prep_base(text)
            dv      = get_fasttext_vec(cleaned, ft_model).reshape(1, -1)
            pred    = int(ft_lr.predict(dv)[0])
            conf    = float(ft_lr.predict_proba(dv)[0][pred])

        elif model == 'fasttext_svm':
            ensure_fasttext_svm()
            cleaned = prep_base(text)
            dv      = get_fasttext_vec(cleaned, ft_model).reshape(1, -1)
            pred    = int(ft_svm.predict(dv)[0])
            try:
                conf = float(ft_svm.predict_proba(dv)[0][pred])
            except (AttributeError, Exception):
                import math
                score = float(ft_svm.decision_function(dv)[0])
                conf  = 1 / (1 + math.exp(-abs(score)))

        elif model == 'lstm':
            ensure_lstm()
            from tensorflow.keras.preprocessing.sequence import pad_sequences
            cleaned  = prep_lstm(text)
            seq      = lstm_tokenizer.texts_to_sequences([cleaned])
            padded   = pad_sequences(seq, maxlen=100, padding='pre', truncating='pre')
            prob     = float(lstm_model.predict(padded, verbose=0)[0][0])
            pred     = 1 if prob >= 0.5 else 0
            conf     = prob if pred == 1 else 1 - prob

        elif model == 'indobert':
            ensure_indobert()
            import torch
            cleaned  = prep_base(text)
            inputs   = bert_tokenizer(
                cleaned,
                return_tensors='pt',
                truncation=True,
                max_length=128,
                padding=True
            )
            with torch.no_grad():
                logits = bert_model(**inputs).logits
            probs = torch.softmax(logits, dim=1)[0]
            pred  = int(torch.argmax(probs))
            conf  = float(probs[pred])

        else:
            return jsonify({'error': 'Unknown model'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    ms = round((time.time() - start) * 1000, 1)

    return jsonify({
        'label':        'Positive' if pred == 1 else 'Negative',
        'label_int':    pred,
        'confidence':   round(conf * 100, 2),
        'cleaned_text': cleaned,
        'inference_ms': ms,
        'model':        model,
    })

@app.route('/api/metrics/<model_id>', methods=['GET'])
def get_metrics(model_id):
    if model_id not in METRICS:
        return jsonify({'error': 'Unknown model'}), 404
    return jsonify(METRICS[model_id])

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, port=port, host='0.0.0.0')