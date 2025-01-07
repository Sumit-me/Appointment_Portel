import Layout from '../../components/Layout';
import ProfessorList from './components/ProfessorList';
import AppointmentList from './components/AppointmentList';
import RefreshButton from '../../components/RefreshButton';
import { useState, useRef } from 'react';

export default function StudentDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const professorListRef = useRef<{ fetchProfessors: () => Promise<void> }>(null);
  const appointmentListRef = useRef<{ fetchAppointments: () => Promise<void> }>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      professorListRef.current?.fetchProfessors(),
      appointmentListRef.current?.fetchAppointments()
    ]);
    setRefreshing(false);
  };

  return (
    <Layout title="Student Dashboard">
      <div className="dashboard-container">
        <div className="refresh-section">
          <h4 className="refresh-text">After any activity, please click the refresh button</h4>
          <RefreshButton onRefresh={handleRefresh} loading={refreshing} />
        </div>
        <div className="space-y-8">
          <ProfessorList ref={professorListRef} />
          <AppointmentList ref={appointmentListRef} />
        </div>
      </div>
    </Layout>
  );
}