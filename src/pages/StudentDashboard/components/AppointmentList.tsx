import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';

const AppointmentList = forwardRef((props, ref) => {
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
        profiles!professor_id (
          full_name
        ),
        availability_slots (
          start_time,
          end_time
        )
      `)
      .eq('student_id', user?.id)
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

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">My Appointments</h2>
        <div className="space-y-4">
          {appointments.map((appointment: any) => (
            <div
              key={appointment.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">
                  Professor {appointment.profiles.full_name}
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
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  appointment.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default AppointmentList;