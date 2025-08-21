import { NextRequest, NextResponse } from 'next/server';
import { DatabaseAPI } from '../../lib/api';

export async function POST(request: NextRequest) {
  try {
    const expenseData = await request.json();
    const result = await DatabaseAPI.addExpense(expenseData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding expense:', error);
    return NextResponse.json(
      { error: 'Failed to add expense' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const academicYear = searchParams.get('year');
    
    if (!academicYear) {
      return NextResponse.json(
        { error: 'Academic year parameter is required' },
        { status: 400 }
      );
    }
    
    const expenses = await DatabaseAPI.getExpensesByYear(academicYear);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}