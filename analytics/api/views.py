import pandas as pd
import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from .utils import get_db
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from bson import ObjectId
import json
import csv

@api_view(['GET'])
def export_csv(request):
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
    monthly_trend = df.groupby('month_year')['amount'].sum().reset_index().to_dict('records')
    
    return Response({
        'total_expense': total_expense,
        'average_expense': avg_expense,
        'max_expense': max_expense,
        'monthly_trend': monthly_trend
    })

@api_view(['POST'])
def predict_expense(request):
    """
    Predicts next month's expense using Linear Regression and Decision Tree.
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
    
    if len(expenses) < 5:
        return Response({'error': 'Not enough data to train models. Need at least 5 records.'}, status=400)
        
    df = pd.DataFrame(expenses)
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    
    # Aggregate by month
    df['month_num'] = df['date'].dt.month + (df['date'].dt.year * 12)
    
    monthly_data = df.groupby('month_num')['amount'].sum().reset_index()
    monthly_data = monthly_data.sort_values('month_num')
    
    if len(monthly_data) < 3:
         return Response({'error': 'Need data spread across at least 3 months for reliable prediction.'}, status=400)
    
    # Prepare X (features - time index) and y (target - amount)
    # We will normalize month_num to start from 0
    min_month = monthly_data['month_num'].min()
    monthly_data['time_index'] = monthly_data['month_num'] - min_month
    
    X = monthly_data[['time_index']]
    y = monthly_data['amount']
    
    # Model 1: Linear Regression
    lr_model = LinearRegression()
    lr_model.fit(X, y)
    
    # Model 2: Decision Tree Regressor
    dt_model = DecisionTreeRegressor(max_depth=3)
    dt_model.fit(X, y)
    
    # Predict for next month
    next_time_index = monthly_data['time_index'].max() + 1
    X_pred = pd.DataFrame({'time_index': [next_time_index]})
    
    lr_prediction = max(0, lr_model.predict(X_pred)[0])
    dt_prediction = max(0, dt_model.predict(X_pred)[0])
    
    return Response({
        'linear_regression_prediction': round(lr_prediction, 2),
        'decision_tree_prediction': round(dt_prediction, 2),
        'historical_trend': monthly_data.to_dict('records')
    })
