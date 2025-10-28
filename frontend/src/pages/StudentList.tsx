import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/api';
import { StudentAccount, AccountStatus, AccountFlag } from '../../../shared/src/types';

const StudentList: React.FC = () => {
  const { data: students, isLoading, error } = useQuery<StudentAccount[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await studentService.getAll();
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading students</div>;

  return (
    <div>
      <h1>Students</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Flags</th>
          </tr>
        </thead>
        <tbody>
          {students?.map((student) => (
            <tr key={student.id}>
              <td>{student.studentId}</td>
              <td>{`${student.firstName} ${student.lastName}`}</td>
              <td>{student.email}</td>
              <td>{student.status}</td>
              <td>{student.flags.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;