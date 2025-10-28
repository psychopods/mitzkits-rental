import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { borrowService } from '../services/api';
import { BorrowTransaction} from '../shared/src/types'; //, TransactionStatus 

const BorrowList: React.FC = () => {
  const { data: transactions, isLoading, error } = useQuery<BorrowTransaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await borrowService.getAll();
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading transactions</div>;

  return (
    <div>
      <h1>Borrow Transactions</h1>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Kit ID</th>
            <th>Borrow Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions?.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.studentId}</td>
              <td>{transaction.kitId}</td>
              <td>{new Date(transaction.borrowDate).toLocaleDateString()}</td>
              <td>{new Date(transaction.dueDate).toLocaleDateString()}</td>
              <td>
                {transaction.returnDate
                  ? new Date(transaction.returnDate).toLocaleDateString()
                  : '-'}
              </td>
              <td>{transaction.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BorrowList;