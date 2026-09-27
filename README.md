# Review Insights Dashboard

Project Description

Build a full-stack AI application that analyzes online product reviews and performs Aspect-Based Sentiment Analysis. The system should classify reviews as positive, negative, or neutral, and also detect sentiment related to specific product aspects such as battery, camera, price, delivery, and quality.

The application should use a Kaggle Amazon product review dataset to train the machine learning model and provide an interactive dashboard for users to analyze review sentiment.

1️⃣ Data Pipeline

Use a Kaggle dataset containing Amazon product reviews.

Example dataset:

Amazon Fine Food Reviews Dataset

The system must implement the following pipeline:

Load dataset from CSV

Extract review text column

Remove missing values

Remove duplicate reviews

Filter dataset to 10,000–20,000 reviews for training

Split the dataset:

80% training

20% testing

Store cleaned dataset in a processed data folder.

2️⃣ NLP Preprocessing

Implement Natural Language Processing preprocessing pipeline:

Convert text to lowercase

Remove punctuation

Remove stopwords

Tokenization

Lemmatization

Libraries to use:

NLTK

spaCy

Create reusable preprocessing functions.

3️⃣ Feature Engineering

Convert text reviews into numerical features using:

TF-IDF Vectorization

Configure TF-IDF with:

Maximum features: 5000

Remove rare terms

Use n-grams (1,2)

Save trained vectorizer for later predictions.

4️⃣ Machine Learning Model

Train and compare multiple models:

Model 1:
Naïve Bayes

Model 2:
Logistic Regression

Evaluation metrics:

Accuracy

Precision

Recall

F1 Score

Confusion Matrix

Select the best model automatically.

Save trained model.

5️⃣ Aspect Extraction Module

Implement aspect extraction using NLP.

Steps:

Perform POS tagging

Extract nouns and noun phrases

Identify common product aspects such as:

Battery

Camera

Price

Delivery

Quality

Then determine sentiment associated with each aspect.

Example output:

Battery → Positive
Camera → Negative
Price → Neutral

6️⃣ Backend API

Create a backend API using Python.

Use:

FastAPI

Endpoints:

POST /predict

Input:

review text

Output:

sentiment prediction

confidence score

detected aspects

sentiment for each aspect

7️⃣ Frontend Dashboard

Build an interactive dashboard with the following features:

User inputs:

Enter product review text

Upload CSV file with reviews

Dashboard outputs:

Sentiment classification result

Sentiment distribution chart

Aspect-based sentiment analysis

Word frequency visualization

Model accuracy metrics

Charts:

Pie chart

Bar chart

Histogram

8️⃣ Application Workflow

User enters review or uploads dataset

↓

Text preprocessing

↓

TF-IDF feature extraction

↓

Machine learning model prediction

↓

Aspect extraction

↓

Sentiment insights displayed in dashboard

9️⃣ Tech Stack

Language:

Python

Libraries:

Pandas
NumPy
Scikit-learn
NLTK
spaCy
Matplotlib

Backend:

FastAPI

Frontend:

Interactive dashboard interface

🔟 Expected Output

The application should provide:

A trained sentiment analysis model

Real-time sentiment prediction

Aspect-level insights

Interactive data visualization dashboard

Future Enhancement

Enable integration of web scraping to automatically collect product reviews from e-commerce websites.   Important Instruction for Lovable

Generate:

Project folder structure

Model training script

API server

Dashboard interface

Instructions to run the application locally

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sentimentanalysisdashboard.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cf5359c8-175e-4a9b-8053-f745fcd22119).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
