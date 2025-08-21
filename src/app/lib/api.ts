// lib/api.ts
import pool from './database';
import { PoolClient } from 'pg';

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
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM donation_stats WHERE id = 1');
      
      if (result.rows.length > 0) {
        return result.rows[0] as DonationStats;
      }
      return null;
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Insert a new donation
  static async insertDonation(donationData: DonationData, slipImageUrl?: string): Promise<unknown> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      
      const query = `
        INSERT INTO donations (
          donor_name, generation, amount, receipt_name, donor_email, 
          tax_id, address, contact_info, publication_consent, slip_image_url, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const values = [
        donationData.donorName,
        donationData.generation,
        parseFloat(donationData.amount) || 0,
        donationData.receiptName,
        donationData.email,
        donationData.taxId,
        donationData.address,
        donationData.contactInfo,
        donationData.publicationConsent,
        slipImageUrl || null,
        'pending'
      ];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting donation:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Get all donations (for admin purposes)
  static async getAllDonations(): Promise<unknown[]> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM donations ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Update donation status
  static async updateDonationStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<unknown> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const query = 'UPDATE donations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      const result = await client.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating donation status:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Get donations by generation (รุ่น)
  static async getDonationsByGeneration(): Promise<DonationByGeneration[]> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const query = `
        SELECT 
          generation,
          SUM(amount) as total_amount,
          COUNT(DISTINCT donor_name) as donor_count
        FROM donations 
        WHERE status = 'approved'
        GROUP BY generation 
        ORDER BY generation
      `;
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching donations by generation:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Get yearly statistics
  static async getYearlyStats(): Promise<YearlyStats[]> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const query = 'SELECT * FROM yearly_stats ORDER BY academic_year DESC';
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching yearly stats:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Add expense/income record
  static async addExpense(expenseData: ExpenseData): Promise<unknown> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const query = `
        INSERT INTO expenses (
          title, description, amount, expense_type, category, 
          academic_year, expense_date, receipt_url, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        expenseData.title,
        expenseData.description,
        expenseData.amount,
        expenseData.expense_type,
        expenseData.category,
        expenseData.academic_year,
        expenseData.expense_date,
        expenseData.receipt_url,
        expenseData.created_by
      ];
      const result = await client.query(query, values);
      
      // Update yearly stats
      await this.updateYearlyStats(expenseData.academic_year, client);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Get expenses by year
  static async getExpensesByYear(academicYear: string): Promise<unknown[]> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const query = 'SELECT * FROM expenses WHERE academic_year = $1 ORDER BY expense_date DESC';
      const result = await client.query(query, [academicYear]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // User management methods
  static async createOrUpdateUser(userData: UserData): Promise<UserData> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const query = `
        INSERT INTO users (email, name, image_url, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          image_url = EXCLUDED.image_url,
          updated_at = NOW()
        RETURNING *
      `;
      const values = [userData.email, userData.name, userData.image_url, userData.role];
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  static async getUserByEmail(email: string): Promise<UserData | null> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  static async getUserDonations(email: string): Promise<unknown[]> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM donations WHERE donor_email = $1 ORDER BY created_at DESC',
        [email]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching user donations:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  static async getLastDonationByEmail(email: string): Promise<unknown | null> {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM donations WHERE donor_email = $1 ORDER BY created_at DESC LIMIT 1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching last donation:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Update yearly statistics
  private static async updateYearlyStats(academicYear: string, client: PoolClient): Promise<void> {
    try {
      // Calculate totals for the year
      const donationsQuery = `
        SELECT COALESCE(SUM(amount), 0) as total_donations, COUNT(DISTINCT donor_name) as donor_count
        FROM donations 
        WHERE status = 'approved' AND EXTRACT(YEAR FROM created_at) = $1
      `;
      
      const expensesQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN expense_type = 'outcome' THEN amount ELSE 0 END), 0) as total_expenses,
          COALESCE(SUM(CASE WHEN expense_type = 'income' THEN amount ELSE 0 END), 0) as total_income
        FROM expenses 
        WHERE academic_year = $1
      `;

      const year = parseInt(academicYear);
      const donationsResult = await client.query(donationsQuery, [year]);
      const expensesResult = await client.query(expensesQuery, [academicYear]);

      const donations = donationsResult.rows[0];
      const expenses = expensesResult.rows[0];
      
      const balance = parseFloat(donations.total_donations) + parseFloat(expenses.total_income) - parseFloat(expenses.total_expenses);

      // Update or insert yearly stats
      const upsertQuery = `
        INSERT INTO yearly_stats (academic_year, total_donations, total_expenses, total_income, donor_count, balance, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (academic_year) 
        DO UPDATE SET 
          total_donations = $2,
          total_expenses = $3,
          total_income = $4,
          donor_count = $5,
          balance = $6,
          updated_at = NOW()
      `;

      await client.query(upsertQuery, [
        academicYear,
        donations.total_donations,
        expenses.total_expenses,
        expenses.total_income,
        donations.donor_count,
        balance
      ]);
    } catch (error) {
      console.error('Error updating yearly stats:', error);
      throw error;
    }
  }
}