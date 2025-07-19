import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface PlannedLeave {
  id: string;
  name: string;
  employee: string;
  startDate: string;
  endDate: string;
}

interface PlannedLeavesSectionProps {
  plannedLeaves: PlannedLeave[];
  containerBgColor: string;
  containerTextColor: string;
  isAddingLeave: boolean;
  setIsAddingLeave: React.Dispatch<React.SetStateAction<boolean>>;
  newLeave: { name: string; employee: string; startDate: string; endDate: string };
  setNewLeave: React.Dispatch<React.SetStateAction<{ name: string; employee: string; startDate: string; endDate: string }>>;
  handleAddPlannedLeave: () => void;
  handleRemovePlannedLeave: (leaveId: string) => void;
}

const PlannedLeavesSection: React.FC<PlannedLeavesSectionProps> = ({
  plannedLeaves,
  containerBgColor,
  containerTextColor,
  isAddingLeave,
  setIsAddingLeave,
  newLeave,
  setNewLeave,
  handleAddPlannedLeave,
  handleRemovePlannedLeave
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-lg flex items-center justify-center text-white text-base">
          🏖️
        </div>
        <div className="text-lg font-semibold text-gray-800 flex-1">Planned Leaves</div>
        <Dialog open={isAddingLeave} onOpenChange={setIsAddingLeave}>
          <DialogTrigger asChild>
            <button className="bg-gradient-to-br from-teal-600 to-emerald-500 text-white border-none px-4 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2 ml-auto hover:from-teal-700 hover:to-emerald-600 transition-all duration-200">
              <Plus size={14} />
              Add Leave
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white text-black">
            <DialogHeader>
              <DialogTitle className="font-bold">Add Planned Leave</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="leave-name" className="font-semibold">Leave Name</Label>
                <Input
                  id="leave-name"
                  value={newLeave.name}
                  onChange={(e) => setNewLeave({...newLeave, name: e.target.value})}
                  placeholder="e.g., Annual Leave"
                  className="font-medium"
                />
              </div>
              <div>
                <Label htmlFor="employee" className="font-semibold">Employee</Label>
                <Input
                  id="employee"
                  value={newLeave.employee}
                  onChange={(e) => setNewLeave({...newLeave, employee: e.target.value})}
                  placeholder="Employee name"
                  className="font-medium"
                />
              </div>
              <div>
                <Label htmlFor="startDate" className="font-semibold">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                  className="font-medium"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="font-semibold">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                  className="font-medium"
                />
              </div>
              <Button
                onClick={handleAddPlannedLeave}
                className="w-full bg-green-600 hover:bg-green-700 font-semibold"
              >
                Add Leave
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Leave Items */}
      {plannedLeaves.length > 0 ? (
        <div>
          {plannedLeaves.map(leave => (
            <div key={leave.id} className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-b-0 group">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">
                🏖️
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-800 mb-1">{leave.name}</h4>
                <p className="text-sm text-teal-600">
                  {leave.employee} • {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                </p>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 rounded transition-all duration-200"
                onClick={() => handleRemovePlannedLeave(leave.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl opacity-80">
            🏖️
          </div>
          <h3 className="text-gray-800 text-lg mb-2">No planned leaves added yet</h3>
          <p className="text-teal-600 text-sm">Click "Add Leave" to create your first leave request</p>
        </div>
      )}
    </div>
  );
};

export default PlannedLeavesSection;