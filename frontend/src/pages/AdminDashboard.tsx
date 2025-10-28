import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/api';
import { SystemConfig, NotificationConfig } from '../../../shared/src/types';

const AdminDashboard: React.FC = () => {
  const { data: config, isLoading: configLoading } = useQuery<SystemConfig>({
    queryKey: ['config'],
    queryFn: async () => {
      const response = await adminService.getConfig();
      return response.data;
    },
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<NotificationConfig[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await adminService.getNotifications();
      return response.data;
    },
  });

  if (configLoading || notificationsLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      <section>
        <h2>System Configuration</h2>
        {config && (
          <div>
            <p>Loan Period: {config.loanPeriodDays} days</p>
            <p>Max Kits Per Student: {config.maxKitsPerStudent}</p>
            <p>Retention Period: {config.retentionPeriodYears} years</p>
            
            <h3>Penalty Rules</h3>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Condition</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {config.penaltyRules.map((rule, index) => (
                  <tr key={index}>
                    <td>{rule.type}</td>
                    <td>{rule.condition}</td>
                    <td>${rule.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2>Notification Settings</h2>
        {notifications && (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Triggers</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification, index) => (
                <tr key={index}>
                  <td>{notification.type}</td>
                  <td>{notification.enabled ? 'Enabled' : 'Disabled'}</td>
                  <td>{notification.triggers.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Maintenance</h2>
        <button onClick={() => adminService.runRetention()}>
          Run Data Retention
        </button>
      </section>
    </div>
  );
};

export default AdminDashboard;