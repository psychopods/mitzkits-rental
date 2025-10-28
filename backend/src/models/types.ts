export interface Kit {
  id: string;
  name: string;
  description?: string;
  status: 'AVAILABLE' | 'BORROWED' | 'DAMAGED' | 'MAINTENANCE';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  createdAt: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id: string;
  studentId: string;
  kitId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  penalties?: string[];
}
