import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { Check, X } from 'lucide-react';

const AppointmentManagement = forwardRef((props, ref) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  async function fetchAppointments() {
    if (!user) return;

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        profiles!student_id (
          full_name
        ),
        availability_slots (
          start_time,
          end_time
        )
      `)
      .eq('professor_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching appointments:', error);
      return;
    }

    setAppointments(data || []);
    setLoading(false);
  }

  useImperativeHandle(ref, () => ({
    fetchAppointments
  }));

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  async function updateAppointmentStatus(appointmentId: string, status: string) {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      console.error('Error updating appointment:', error);
      return;
    }

    fetchAppointments();
  }

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  const pendingAppointments = appointments.filter(
    (apt: any) => apt.status === 'pending'
  );
  const approvedAppointments = appointments.filter(
    (apt: any) => apt.status === 'approved'
  );

  return (
    <div className="space-y-6">
      {/* Pending Appointments */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Pending Appointments
          </h2>
          <div className="space-y-4">
            {pendingAppointments.map((appointment: any) => (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    Student: {appointment.profiles.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(
                      new Date(appointment.availability_slots.start_time),
                      'MMM d, yyyy h:mm a'
                    )}
                    {' - '}
                    {format(
                      new Date(appointment.availability_slots.end_time),
                      'h:mm a'
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'approved')}
                    className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approved Appointments */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Upcoming Appointments
          </h2>
          <div className="space-y-4">
            {approvedAppointments.map((appointment: any) => (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    Student: {appointment.profiles.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(
                      new Date(appointment.availability_slots.start_time),
                      'MMM d, yyyy h:mm a'
                    )}
                    {' - '}
                    {format(
                      new Date(appointment.availability_slots.end_time),
                      'h:mm a'
                    )}
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Approved
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AppointmentManagement;