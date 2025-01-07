import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { Trash2 } from 'lucide-react';
import { isSlotExpired } from '../../../utils/dateUtils';

const SlotManagement = forwardRef((props, ref) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });
  const { user } = useAuth();

  async function fetchSlots() {
    if (!user) return;

    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('professor_id', user.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching slots:', error);
      return;
    }

    setSlots(data || []);
    setLoading(false);
  }

  useImperativeHandle(ref, () => ({
    fetchSlots
  }));

  useEffect(() => {
    if (user) {
      fetchSlots();
    }
  }, [user]);

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    const startDateTime = new Date(`${newSlot.date}T${newSlot.startTime}`);
    const endDateTime = new Date(`${newSlot.date}T${newSlot.endTime}`);

    if (isSlotExpired(startDateTime.toISOString())) {
      alert('Cannot add slots in the past');
      return;
    }

    const { error } = await supabase.from('availability_slots').insert([
      {
        professor_id: user?.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      },
    ]);

    if (error) {
      console.error('Error adding slot:', error);
      return;
    }

    setNewSlot({ date: '', startTime: '', endTime: '' });
    fetchSlots();
  }

  async function deleteSlot(slotId: string) {
    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', slotId);

    if (error) {
      console.error('Error deleting slot:', error);
      return;
    }

    fetchSlots();
  }

  if (loading) {
    return <div>Loading slots...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Manage Availability Slots
        </h2>

        <form onSubmit={addSlot} className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Slot
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots
            .filter((slot) => !slot.is_booked && !isSlotExpired(slot.start_time))
            .map((slot) => (
              <div
                key={slot.id}
                className="border rounded-lg p-4 flex justify-between items-center"
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
                  onClick={() => deleteSlot(slot.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
});

export default SlotManagement;