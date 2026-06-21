import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ModelPage from './components/ModelPage'

export const MODELS = [
  {
    id: 'tfidf_lr',
    group: 'TF-IDF',
    name: 'Logistic Regression',
    short: 'TF-IDF + LR',
    color: '#7c6af7',
    colorDim: '#3d3566',
    description: 'TF-IDF converts text into numerical feature vectors by measuring how important a word is in a document relative to the whole corpus. Combined with Logistic Regression, it learns a linear decision boundary to classify sentiment. This is the most common baseline in Indonesian NLP.',
    pipeline: ['Cleaning & lowercasing', 'Stopword removal (keep negation)', 'Stemming via Sastrawi', 'TF-IDF Vectorizer (max 5000 features)', 'Logistic Regression classifier'],
    badge: 'Classical ML',
    simulated: false,
  },
  {
    id: 'tfidf_svm',
    group: 'TF-IDF',
    name: 'Support Vector Machine (SVM)',
    short: 'TF-IDF + SVM',
    color: '#7c6af7',
    colorDim: '#3d3566',
    description: 'Same TF-IDF representation, but classified using a Support Vector Machine with a linear kernel. SVM finds the maximum-margin hyperplane that best separates positive and negative reviews in the high-dimensional TF-IDF space — often outperforming logistic regression on sparse text features.',
    pipeline: ['Cleaning & lowercasing', 'Stopword removal (keep negation)', 'Stemming via Sastrawi', 'TF-IDF Vectorizer (max 5000 features)', 'SVM with linear kernel'],
    badge: 'Classical ML',
    simulated: false,
  },
  {
    id: 'fasttext_lr',
    group: 'FastText',
    name: 'Logistic Regression',
    short: 'FastText + LR',
    color: '#f59e0b',
    colorDim: '#3d2f0a',
    description: 'FastText learns dense 100-dimensional word embeddings that capture semantic similarity. Each review is represented as the mean of its word vectors, creating a fixed-size document embedding. Logistic Regression then classifies this embedding.',
    pipeline: ['Cleaning & lowercasing', 'Stopword removal (keep negation)', 'FastText word embeddings (dim=100, epoch=25)', 'Document vector via mean pooling', 'Logistic Regression classifier'],
    badge: 'Embeddings + ML',
    simulated: false,
  },
  {
    id: 'fasttext_svm',
    group: 'FastText',
    name: 'Support Vector Machine (SVM)',
    short: 'FastText + SVM',
    color: '#f59e0b',
    colorDim: '#3d2f0a',
    description: 'FastText embeddings pooled into document vectors, classified by an SVM with an RBF kernel. The non-linear kernel can capture curved decision boundaries in embedding space — useful when sentiment depends on subtle semantic combinations.',
    pipeline: ['Cleaning & lowercasing', 'Stopword removal (keep negation)', 'FastText word embeddings (dim=100, epoch=25)', 'Document vector via mean pooling', 'SVM with RBF kernel'],
    badge: 'Embeddings + ML',
    simulated: false,
  },
  {
    id: 'lstm',
    group: 'LSTM',
    name: 'Long Short-Term Memory',
    short: 'LSTM',
    color: '#3ecf8e',
    colorDim: '#1a3d2b',
    description: 'LSTM processes text as a sequence, maintaining memory of previous tokens through gating mechanisms. This lets it handle long-range dependencies — e.g. a negation word at the start of a sentence affecting a sentiment word much later. Architecture: Embedding(128) → SpatialDropout → LSTM(64) → Dense(32) → sigmoid.',
    pipeline: ['Cleaning & lowercasing', 'Keras Tokenizer (vocab=5000)', 'Pad sequences to length 100', 'Embedding layer (dim=128)', 'LSTM (64 units, dropout=0.2)', 'Dense sigmoid output'],
    badge: 'Deep Learning',
    simulated: false,
  },
  {
    id: 'indobert',
    group: 'IndoBERT',
    name: 'BERT Sequence Classification',
    short: 'IndoBERT',
    color: '#f87171',
    colorDim: '#3d1f1f',
    description: 'IndoBERT is a BERT model pre-trained on large Indonesian corpora. Fine-tuned for binary sentiment classification with BertForSequenceClassification. Bidirectional self-attention attends to all tokens simultaneously, making it the most contextually aware model in this project.',
    pipeline: ['Cleaning & lowercasing', 'BertTokenizer (max_length=128)', 'IndoBERT base (indobenchmark/indobert-base-p1)', 'Sequence classification head', 'Fine-tuning: 3 epochs, batch=8, lr warmup'],
    badge: 'Transformer',
    simulated: false,
  },
]

export default function App() {
  const [activeId, setActiveId] = useState('tfidf_lr')
  const activeModel = MODELS.find(m => m.id === activeId)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar models={MODELS} activeId={activeId} onSelect={setActiveId} />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        <ModelPage model={activeModel} />
      </main>
    </div>
  )
}