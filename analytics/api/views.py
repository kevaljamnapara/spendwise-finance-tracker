import pandas as pd
import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from .utils import get_db
from sklearn.linear_model import LinearRegression
from bson import ObjectId
import json
import csv
import plotly.express as px

"""
What this file does: 
This file defines the API endpoints (views) for the Django analytics service. It handles exporting data to CSV, generating summary analytics, and predicting future expenses.

Why this logic exists: 
To provide advanced data processing capabilities (like Pandas aggregation and Machine Learning) separate from the main Node.js CRUD server. This microservice architecture allows using Python's strong data science ecosystem.
"""

@api_view(['GET'])
def export_csv(request):
    """
    What this function does: 
    Exports all expense records from MongoDB into a downloadable CSV file.
    
    Why this logic exists: 
    Allows users to download their financial data for offline use or backup.
    
    Input: GET request to the endpoint.
    Output: An HTTP response with a CSV file attachment.
    Flow: 
    1. Connects to MongoDB.
    2. Fetches all expense records.
    3. Iterates over records and writes them to a CSV format.
    4. Returns the CSV as a downloadable response.
    """
    db = get_db()
    # In a real app we'd filter by user_id from token
    expenses = list(db.expenses.find({}))
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="expenses.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['ID', 'Amount', 'Date', 'Description', 'Category ID'])
    
    for expense in expenses:
        writer.writerow([
            str(expense.get('_id')),
            expense.get('amount', 0),
            expense.get('date', ''),
            expense.get('description', ''),
            str(expense.get('category', ''))
        ])
        
    return response

@api_view(['GET'])
def analytics_summary(request):
    """
    What this function does: 
    Generates a summary of expenses including total, average, maximum, and a monthly trend, alongside a Plotly chart configuration.
    
    Why this logic exists: 
    To provide high-level insights into the user's spending habits using Pandas for efficient data aggregation.
    
    Input: GET request.
    Output: JSON containing total, average, max expenses, monthly trend data, and Plotly chart JSON.
    Flow:
    1. Fetches expenses from MongoDB.
    2. Converts data to a Pandas DataFrame.
    3. Cleans numeric and date fields.
    4. Aggregates data to calculate metrics (total, avg, max).
    5. Groups data by month for trend analysis.
    6. Generates a Plotly chart JSON for the monthly trend.
    7. Returns the compiled JSON response.
    """
    db = get_db()
    expenses = list(db.expenses.find({}))
    
    if not expenses:
        return Response({'message': 'No data available'})
        
    # Pandas Data Cleaning & Analytics
    df = pd.DataFrame(expenses)
    
    # Clean data
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    
    # Analytics
    total_expense = df['amount'].sum()
    avg_expense = df['amount'].mean()
    max_expense = df['amount'].max()
    
    # Group by month
    df['month_year'] = df['date'].dt.to_period('M').astype(str)
    monthly_trend_df = df.groupby('month_year')['amount'].sum().reset_index()
    monthly_trend = monthly_trend_df.to_dict('records')
    
    # Plotly integration
    fig = px.bar(
        monthly_trend_df, 
        x='month_year', 
        y='amount', 
        title='Monthly Expense Trend',
        labels={'month_year': 'Month', 'amount': 'Amount'}
    )
    # Convert Plotly figure to JSON so frontend can easily render it
    plotly_json = fig.to_json()
    
    return Response({
        'total_expense': total_expense,
        'average_expense': avg_expense,
        'max_expense': max_expense,
        'monthly_trend': monthly_trend,
        'plotly_chart': plotly_json
    })

@api_view(['POST'])
def predict_expense(request):
    """
    ==========================================
    VIVA TIP - MACHINE LEARNING & PANDAS
    ==========================================
    What this function does: 
    Predicts the next month's expense using a Linear Regression model based on historical data.
    
    Why this logic exists: 
    To give users a forecast of their future spending.
    
    Key Concepts to Explain in Viva:
    1. Pandas: We use Pandas DataFrames because they make cleaning (handling missing dates/amounts) 
       and grouping data by month extremely fast and easy compared to standard Python loops.
    2. Linear Regression: We chose Scikit-Learn's LinearRegression because it is a fast, interpretable baseline model.
       It works by plotting a "line of best fit" through historical monthly totals to predict the next point.
       It is much simpler and less prone to overfitting than complex models (like Decision Trees) for small datasets.
    
    Flow:
    1. Queries expenses for the specific user.
    2. Cleans data and aggregates amounts by month using Pandas.
    3. Creates a time index (X) and target amounts (y) for the machine learning model.
    4. Trains the Linear Regression model on historical data.
    5. Predicts the amount for the next sequential month.
    """
    db = get_db()
    
    # Ideally get user from auth token
    user_id_str = request.data.get('user_id')
    query = {}
    if user_id_str:
        try:
            query['user'] = ObjectId(user_id_str)
        except:
            pass
            
    expenses = list(db.expenses.find(query))
    
    if len(expenses) < 1:
        return Response({'error': 'No expense records found. Please add some expenses first.'}, status=400)
        
    df = pd.DataFrame(expenses)
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    
    if df.empty:
        return Response({'error': 'No valid expense records with dates found.'}, status=400)
    
    # Aggregate by month
    df['month_num'] = df['date'].dt.month + (df['date'].dt.year * 12)
    
    monthly_data = df.groupby('month_num')['amount'].sum().reset_index()
    monthly_data = monthly_data.sort_values('month_num')
    
    if len(monthly_data) < 1:
        return Response({'error': 'No monthly expense records could be compiled.'}, status=400)
        
    if len(monthly_data) == 1:
        # Fallback for single month of data
        single_amount = float(monthly_data.iloc[0]['amount'])
        return Response({
            'linear_regression_prediction': round(single_amount, 2),
            'historical_trend': monthly_data.to_dict('records')
        })
    
    # Prepare X (features - time index) and y (target - amount)
    # We will normalize month_num to start from 0 for the model
    min_month = monthly_data['month_num'].min()
    monthly_data['time_index'] = monthly_data['month_num'] - min_month
    
    X = monthly_data[['time_index']]
    y = monthly_data['amount']
    
    # Machine Learning Model: Linear Regression
    lr_model = LinearRegression()
    lr_model.fit(X, y)
    
    # Predict for next month
    next_time_index = monthly_data['time_index'].max() + 1
    X_pred = pd.DataFrame({'time_index': [next_time_index]})
    
    lr_prediction = max(0, lr_model.predict(X_pred)[0])
    
    return Response({
        'linear_regression_prediction': round(float(lr_prediction), 2),
        'historical_trend': monthly_data.to_dict('records')
    })
