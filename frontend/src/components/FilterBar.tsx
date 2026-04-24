import { useState, useRef, useEffect } from "react";
import { Search, X, Filter, ChevronDown, CheckSquare, Square } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function FilterBar({ searchQuery, setSearchQuery, filterAssignees, setFilterAssignees, members }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tự động đóng Dropdown khi người dùng click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAssignee = (val: string) => {
    if (filterAssignees.includes(val)) {
      setFilterAssignees(filterAssignees.filter((v: string) => v !== val)); // Bỏ tick
    } else {
      setFilterAssignees([...filterAssignees, val]); // Tích chọn
    }
  };

  const getDropdownLabel = () => {
    if (filterAssignees.length === 0) return "Tất cả thành viên";
    if (filterAssignees.length === 1) {
      if (filterAssignees[0] === "UNASSIGNED") return "👤 Chưa giao việc";
      const member = members?.find((m: any) => m.participantId.toString() === filterAssignees[0]);
      return member ? `🧑‍💻 ${member.fullName}` : "Đã chọn 1";
    }
    return `Đã chọn ${filterAssignees.length} người`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center text-gray-500 px-3 font-black text-sm uppercase tracking-wider whitespace-nowrap">
        <Filter className="w-4 h-4 mr-2" /> Lọc
      </div>
      
      {/* Lọc theo Tên Task */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Tìm nhanh tên công việc..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-gray-50/50 border-gray-200 hover:bg-gray-100 focus:bg-white transition-colors h-10 w-full font-medium"
        />
      </div>

      {/* Nút lọc Multi-select Thành viên */}
      <div className="flex gap-2 w-full sm:w-auto relative" ref={dropdownRef}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between h-10 w-full sm:w-64 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
        >
          <span className="truncate pr-2">{getDropdownLabel()}</span>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </div>

        {/* Bảng thả xuống (Dropdown Menu) */}
        {isOpen && (
          <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2 max-h-60 overflow-y-auto">
            {/* Tùy chọn: Chưa giao cho ai */}
            <div 
              onClick={() => toggleAssignee("UNASSIGNED")}
              className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {filterAssignees.includes("UNASSIGNED") ? <CheckSquare className="h-4 w-4 text-blue-600 mr-3" /> : <Square className="h-4 w-4 text-gray-300 mr-3" />}
              <span className="text-sm font-medium text-gray-700">👤 Chưa giao cho ai</span>
            </div>
            
            <div className="h-px bg-gray-100 my-1 mx-4"></div>

            {/* Danh sách thành viên */}
            {members?.map((m: any) => {
              const isSelected = filterAssignees.includes(m.participantId.toString());
              return (
                <div 
                  key={m.participantId} 
                  onClick={() => toggleAssignee(m.participantId.toString())}
                  className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {isSelected ? <CheckSquare className="h-4 w-4 text-blue-600 mr-3" /> : <Square className="h-4 w-4 text-gray-300 mr-3" />}
                  <span className="text-sm font-medium text-gray-700 truncate">🧑‍💻 {m.fullName}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Nút Xóa Lọc */}
        {(searchQuery || filterAssignees.length > 0) && (
          <Button 
            variant="ghost" 
            onClick={() => { setSearchQuery(""); setFilterAssignees([]); setIsOpen(false); }}
            className="h-10 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold ml-1"
          >
            <X className="h-4 w-4 mr-1" /> Xóa
          </Button>
        )}
      </div>
    </div>
  );
}