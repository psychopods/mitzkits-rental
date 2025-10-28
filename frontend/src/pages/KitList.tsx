import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { kitService } from '../services/api';
import { Kit } from '../shared/src/types'; //, KitStatus, KitCondition

const KitList: React.FC = () => {
  const { data: kits, isLoading, error } = useQuery<Kit[]>({
    queryKey: ['kits'],
    queryFn: async () => {
      const response = await kitService.getAll();
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading kits</div>;

  return (
    <div>
      <h1>Kits</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Condition</th>
            <th>Components</th>
          </tr>
        </thead>
        <tbody>
          {kits?.map((kit) => (
            <tr key={kit.id}>
              <td>{kit.name}</td>
              <td>{kit.description}</td>
              <td>{kit.status}</td>
              <td>{kit.condition}</td>
              <td>{kit.components.length} items</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KitList;