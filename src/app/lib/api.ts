// lib/api.ts
import { prisma } from './prisma';
import { Prisma } from '@/generated/prisma/client';

export interface DonationData {
  donorName: string;
  generation: string;
  amount: string;
  receiptName: string;
  email: string;
  taxId: string;
  address: string;
  contactInfo: string;
  publicationConsent: 'full' | 'name_only' | 'anonymous';
  slip?: File | null;
}

export interface DonationStats {
  total_amount: number;
  total_donors: number;
  target_amount: number;
}

export interface YearlyStats {
  academic_year: string;
  total_donations: number;
  total_expenses: number;
  total_income: number;
  donor_count: number;
  balance: number;
}

export interface ExpenseData {
  id?: number;
  title: string;
  description?: string;
  amount: number;
  expense_type: 'income' | 'outcome';
  category?: string;
  academic_year: string;
  expense_date: string;
  receipt_url?: string;
  created_by?: string;
}

export interface DonationByGeneration {
  generation: string;
  total_amount: number;
  donor_count: number;
}

export interface UserData {
  id?: number;
  email: string;
  name?: string;
  image_url?: string;
  role: 'user' | 'admin';
}

export class DatabaseAPI {
  // Get donation statistics
  static async getDonationStats(): Promise<DonationStats | null> {
    try {
      const stats = await prisma.donationStats.findFirst({
        where: { id: 1 }
      });
      
      if (stats) {
        return {
          total_amount: Number(stats.total_amount),
          total_donors: stats.total_donors,
          target_amount: Number(stats.target_amount)
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      throw error;
    }
  }

  // Insert a new donation
  static async insertDonation(donationData: DonationData, slipImageUrl?: string): Promise<unknown> {
    try {
      const donation = await prisma.donation.create({
        data: {
          donor_name: donationData.donorName,
          generation: donationData.generation,
          amount: new Prisma.Decimal(parseFloat(donationData.amount) || 0),
          receipt_name: donationData.receiptName,
          donor_email: donationData.email,
          tax_id: donationData.taxId,
          address: donationData.address,
          contact_info: donationData.contactInfo,
          publication_consent: donationData.publicationConsent,
          slip_image_url: slipImageUrl || null,
          status: 'pending'
        }
      });
      return donation;
    } catch (error) {
      console.error('Error inserting donation:', error);
      throw error;
    }
  }

  // Get all donations (for admin purposes)
  static async getAllDonations(): Promise<unknown[]> {
    try {
      const donations = await prisma.donation.findMany({
        orderBy: { created_at: 'desc' }
      });
      return donations;
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  }

  // Update donation status
  static async updateDonationStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<unknown> {
    try {
      const donation = await prisma.donation.update({
        where: { id },
        data: { status }
      });
      return donation;
    } catch (error) {
      console.error('Error updating donation status:', error);
      throw error;
    }
  }

  // Get donations by generation (รุ่น)
  static async getDonationsByGeneration(): Promise<DonationByGeneration[]> {
    try {
      const result = await prisma.donation.groupBy({
        by: ['generation'],
        where: { status: 'approved' },
        _sum: { amount: true },
        _count: { donor_name: true },
        orderBy: { generation: 'asc' }
      });
      
      return result.map(item => ({
        generation: item.generation,
        total_amount: Number(item._sum.amount || 0),
        donor_count: item._count.donor_name
      }));
    } catch (error) {
      console.error('Error fetching donations by generation:', error);
      throw error;
    }
  }

  // Get yearly statistics
  static async getYearlyStats(): Promise<YearlyStats[]> {
    try {
      const stats = await prisma.yearlyStats.findMany({
        orderBy: { academic_year: 'desc' }
      });
      
      return stats.map(stat => ({
        academic_year: stat.academic_year,
        total_donations: Number(stat.total_donations),
        total_expenses: Number(stat.total_expenses),
        total_income: Number(stat.total_income),
        donor_count: stat.donor_count,
        balance: Number(stat.balance)
      }));
    } catch (error) {
      console.error('Error fetching yearly stats:', error);
      throw error;
    }
  }

  // Add expense/income record
  static async addExpense(expenseData: ExpenseData): Promise<unknown> {
    try {
      const expense = await prisma.expense.create({
        data: {
          title: expenseData.title,
          description: expenseData.description,
          amount: new Prisma.Decimal(expenseData.amount),
          expense_type: expenseData.expense_type,
          category: expenseData.category,
          academic_year: expenseData.academic_year,
          expense_date: new Date(expenseData.expense_date),
          receipt_url: expenseData.receipt_url,
          created_by: expenseData.created_by
        }
      });
      
      // Update yearly stats
      await this.updateYearlyStats(expenseData.academic_year);
      
      return expense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  // Get expenses by year
  static async getExpensesByYear(academicYear: string): Promise<unknown[]> {
    try {
      const expenses = await prisma.expense.findMany({
        where: { academic_year: academicYear },
        orderBy: { expense_date: 'desc' }
      });
      return expenses;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  // User management methods
  static async createOrUpdateUser(userData: UserData): Promise<UserData> {
    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          image_url: userData.image_url
        },
        create: {
          email: userData.email,
          name: userData.name,
          image_url: userData.image_url,
          role: userData.role
        }
      });
      
      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        image_url: user.image_url || undefined,
        role: user.role as 'user' | 'admin'
      };
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<UserData | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) return null;
      
      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        image_url: user.image_url || undefined,
        role: user.role as 'user' | 'admin'
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async getUserDonations(email: string): Promise<unknown[]> {
    try {
      const donations = await prisma.donation.findMany({
        where: { donor_email: email },
        orderBy: { created_at: 'desc' }
      });
      return donations;
    } catch (error) {
      console.error('Error fetching user donations:', error);
      throw error;
    }
  }

  static async getLastDonationByEmail(email: string): Promise<unknown | null> {
    try {
      const donation = await prisma.donation.findFirst({
        where: { donor_email: email },
        orderBy: { created_at: 'desc' }
      });
      return donation;
    } catch (error) {
      console.error('Error fetching last donation:', error);
      throw error;
    }
  }

  // Update yearly statistics
  private static async updateYearlyStats(academicYear: string): Promise<void> {
    try {
      const year = parseInt(academicYear);
      
      // Calculate donation totals for the year
      const donationStats = await prisma.donation.aggregate({
        where: {
          status: 'approved',
          created_at: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`)
          }
        },
        _sum: { amount: true },
        _count: { donor_name: true }
      });

      // Calculate expense totals for the year
      const expenseStats = await prisma.expense.aggregate({
        where: { academic_year: academicYear },
        _sum: { amount: true }
      });

      const totalOutcome = await prisma.expense.aggregate({
        where: { 
          academic_year: academicYear,
          expense_type: 'outcome'
        },
        _sum: { amount: true }
      });

      const totalIncome = await prisma.expense.aggregate({
        where: { 
          academic_year: academicYear,
          expense_type: 'income'
        },
        _sum: { amount: true }
      });

      const totalDonations = Number(donationStats._sum.amount || 0);
      const totalExpenses = Number(totalOutcome._sum.amount || 0);
      const totalIncomeAmount = Number(totalIncome._sum.amount || 0);
      const donorCount = donationStats._count.donor_name;
      const balance = totalDonations + totalIncomeAmount - totalExpenses;

      // Update or insert yearly stats
      await prisma.yearlyStats.upsert({
        where: { academic_year: academicYear },
        update: {
          total_donations: new Prisma.Decimal(totalDonations),
          total_expenses: new Prisma.Decimal(totalExpenses),
          total_income: new Prisma.Decimal(totalIncomeAmount),
          donor_count: donorCount,
          balance: new Prisma.Decimal(balance)
        },
        create: {
          academic_year: academicYear,
          total_donations: new Prisma.Decimal(totalDonations),
          total_expenses: new Prisma.Decimal(totalExpenses),
          total_income: new Prisma.Decimal(totalIncomeAmount),
          donor_count: donorCount,
          balance: new Prisma.Decimal(balance)
        }
      });
    } catch (error) {
      console.error('Error updating yearly stats:', error);
      throw error;
    }
  }
}