import Layout from '../../components/Layout';
import AppointmentManagement from './components/AppointmentManagement';
import SlotManagement from './components/SlotManagement';
import RefreshButton from '../../components/RefreshButton';
import { useState, useRef } from 'react';

export default function ProfessorDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const appointmentManagementRef = useRef<{ fetchAppointments: () => Promise<void> }>(null);
  const slotManagementRef = useRef<{ fetchSlots: () => Promise<void> }>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      appointmentManagementRef.current?.fetchAppointments(),
      slotManagementRef.current?.fetchSlots()
    ]);
    setRefreshing(false);
  };

  return (
    <Layout title="Professor Dashboard">
      <div className="dashboard-container">
        <div className="refresh-section">
          <h4 className="refresh-text">After any activity, please click the refresh button</h4>
          <RefreshButton onRefresh={handleRefresh} loading={refreshing} />
        </div>
        <div className="space-y-8">
          <SlotManagement ref={slotManagementRef} />
          <AppointmentManagement ref={appointmentManagementRef} />
        </div>
      </div>
    </Layout>
  );
}