import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { isSlotExpired } from '../../../utils/dateUtils';

const ProfessorList = forwardRef((props, ref) => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  async function fetchProfessors() {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        availability_slots (
          id,
          start_time,
          end_time,
          is_booked
        )
      `)
      .eq('role', 'professor');

    if (error) {
      console.error('Error fetching professors:', error);
      return;
    }

    setProfessors(data || []);
    setLoading(false);
  }

  useImperativeHandle(ref, () => ({
    fetchProfessors
  }));

  useEffect(() => {
    if (user) {
      fetchProfessors();
    }
  }, [user]);

  async function bookSlot(professorId: string, slotId: string) {
    if (!user) return;

    const { error } = await supabase.from('appointments').insert([
      {
        professor_id: professorId,
        student_id: user.id,
        slot_id: slotId,
        status: 'pending',
      },
    ]);

    if (error) {
      console.error('Error booking slot:', error);
      return;
    }

    fetchProfessors();
  }

  if (loading) {
    return <div>Loading professors...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Available Professors</h2>
        <div className="space-y-6">
          {professors.map((professor: any) => (
            <div key={professor.id} className="border-b pb-4">
              <h3 className="text-lg font-medium">{professor.full_name}</h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {professor.availability_slots
                  ?.filter((slot: any) => !slot.is_booked && !isSlotExpired(slot.start_time))
                  .map((slot: any) => (
                    <div
                      key={slot.id}
                      className="border rounded p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(slot.start_time), 'MMM d, yyyy')}
                        </div>
                        <div>
                          {format(new Date(slot.start_time), 'h:mm a')} -{' '}
                          {format(new Date(slot.end_time), 'h:mm a')}
                        </div>
                      </div>
                      <button
                        onClick={() => bookSlot(professor.id, slot.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Book
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProfessorList;