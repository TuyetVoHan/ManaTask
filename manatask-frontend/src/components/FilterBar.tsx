import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface User {
  id: string;
  name: string;
  email: string;
}

interface FilterBarProps {
  users: User[];
  searchQuery: string;
  selectedAssignee: string;
  selectedDeadline: string;
  selectedStoryPoints: string;
  onSearchChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  onDeadlineChange: (value: string) => void;
  onStoryPointsChange: (value: string) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  users,
  searchQuery,
  selectedAssignee,
  selectedDeadline,
  selectedStoryPoints,
  onSearchChange,
  onAssigneeChange,
  onDeadlineChange,
  onStoryPointsChange,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters =
    searchQuery ||
    selectedAssignee !== "all" ||
    selectedDeadline !== "all" ||
    selectedStoryPoints !== "all";

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-700">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-600"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Assignee Filter */}
            <Select value={selectedAssignee} onValueChange={onAssigneeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Deadline Filter */}
            <Select value={selectedDeadline} onValueChange={onDeadlineChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Deadlines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deadlines</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="no-deadline">No Deadline</SelectItem>
              </SelectContent>
            </Select>

            {/* Story Points Filter */}
            <Select
              value={selectedStoryPoints}
              onValueChange={onStoryPointsChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Story Points" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Story Points</SelectItem>
                <SelectItem value="1-3">1-3 (Low)</SelectItem>
                <SelectItem value="4-5">4-5 (Medium)</SelectItem>
                <SelectItem value="6-8">6-8 (High)</SelectItem>
                <SelectItem value="9+">9+ (Very High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
