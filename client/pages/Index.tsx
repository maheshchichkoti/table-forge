import React, { useEffect, useState } from "react";
import { Search, ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, MoreVertical, ArrowUpDown, GripVertical } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  gender: string;
  country: string;
  age: number;
  picture: string;
}

interface RandomUserResult {
  gender: string;
  name: { title: string; first: string; last: string };
  location: { country: string };
  email: string;
  dob: { age: number };
  picture: { large: string };
  login: { uuid: string };
}

type SortDirection = "asc" | "desc" | null;

export default function Index() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<'name' | 'country' | 'age' | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery, genderFilter, countryFilter, sortColumn, sortDirection]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://randomuser.me/api/?results=25&nat=us");
      const data = await response.json();

      const transformedUsers: User[] = data.results.map((user: RandomUserResult) => ({
        id: user.login.uuid,
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        gender: user.gender.charAt(0).toUpperCase() + user.gender.slice(1),
        country: user.location.country,
        age: user.dob.age,
        picture: user.picture.large,
      }));

      // apply saved order from localStorage if present
      const savedOrder = localStorage.getItem("userOrder");
      if (savedOrder) {
        try {
          const order: string[] = JSON.parse(savedOrder);
          const ordered = order
            .map((id) => transformedUsers.find((u) => u.id === id))
            .filter(Boolean) as User[];
          const remaining = transformedUsers.filter((u) => !order.includes(u.id));
          const finalList = [...ordered, ...remaining];
          setUsers(finalList);
          setFilteredUsers(finalList);
        } catch (e) {
          setUsers(transformedUsers);
          setFilteredUsers(transformedUsers);
        }
      } else {
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let result = [...users];

    if (searchQuery) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (genderFilter !== "all") {
      result = result.filter((user) => user.gender.toLowerCase() === genderFilter.toLowerCase());
    }

    if (countryFilter !== "all") {
      result = result.filter((user) => user.country === countryFilter);
    }

    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  };

  const handleSort = (column: 'name' | 'country' | 'age') => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const uniqueCountries = Array.from(new Set(users.map((user) => user.country))).sort();

  // drag-and-drop (improved UX)
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDragFromIndex(index);
    setDragOverIndex(index);
    try {
      e.dataTransfer.setData("text/plain", String(index));
      e.dataTransfer.effectAllowed = "move";
      // Create a semi-transparent drag image
      const target = e.currentTarget as HTMLElement;
      if (target) {
        const clone = target.cloneNode(true) as HTMLElement;
        clone.style.opacity = "0.5";
        clone.style.position = "absolute";
        clone.style.top = "-9999px";
        document.body.appendChild(clone);
        e.dataTransfer.setDragImage(clone, 0, 0);
        setTimeout(() => document.body.removeChild(clone), 0);
      }
    } catch (err) {}
  };

  const onDragEnter = (_e: React.DragEvent, index: number) => {
    setDragOverIndex(index);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = "move";
    } catch (err) {}
  };

  const onDragEnd = () => {
    setDragFromIndex(null);
    setDragOverIndex(null);
  };

  const onDropAt = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      setDragFromIndex(null);
      setDragOverIndex(null);
      return;
    }

    setUsers((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      try {
        localStorage.setItem("userOrder", JSON.stringify(copy.map((u) => u.id)));
      } catch (e) {}
      return copy;
    });

    setDragFromIndex(null);
    setDragOverIndex(null);
  };

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  useEffect(() => {
    try {
      if (users.length) localStorage.setItem("userOrder", JSON.stringify(users.map((u) => u.id)));
    } catch (e) {}
  }, [users]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#1F252E] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#65758B]">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-[30px] font-bold leading-[36px] text-[#1F252E] mb-2">User Directory</h1>
          <p className="text-base leading-6 text-[#65758B]">Manage and explore user data with advanced filtering, sorting, and search capabilities.</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-[#E1E7EF] bg-[#FAFAFA] text-sm text-[#1F252E] placeholder:text-[#65758B] focus:outline-none focus:ring-2 focus:ring-[#1F252E] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#65758B]" />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="h-10 pl-3 pr-10 rounded-md border border-[#E1E7EF] bg-[#FAFAFA] text-sm text-[#1F252E] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F252E] focus:border-transparent"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F252E] opacity-50 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="h-10 pl-3 pr-10 rounded-md border border-[#E1E7EF] bg-[#FAFAFA] text-sm text-[#1F252E] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F252E] focus:border-transparent"
              >
                <option value="all">All Countries</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F252E] opacity-50 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#E1E7EF] bg-white shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-[#E1E7EF]">
                  <th className="w-12 px-4"></th>
                  <th className="text-left px-2 py-3">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-semibold text-[#1F252E]">Name</span>
                      <ArrowUpDown className={`w-4 h-4 ${sortColumn === 'name' ? 'text-[#1F252E]' : 'text-[#1F252E] opacity-50'}`} />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <span className="text-sm font-semibold text-[#1F252E]">Email</span>
                  </th>
                  <th className="text-left px-4 py-3">
                    <span className="text-sm font-semibold text-[#1F252E]">Gender</span>
                  </th>
                  <th className="text-left px-2 py-3">
                    <button onClick={() => handleSort('country')} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-semibold text-[#1F252E]">Country</span>
                      <ArrowUpDown className={`w-4 h-4 ${sortColumn === 'country' ? 'text-[#1F252E]' : 'text-[#1F252E] opacity-50'}`} />
                    </button>
                  </th>
                  <th className="text-left px-2 py-3">
                    <button onClick={() => handleSort('age')} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-semibold text-[#1F252E]">Age</span>
                      <ArrowUpDown className={`w-4 h-4 ${sortColumn === 'age' ? 'text-[#1F252E]' : 'text-[#1F252E] opacity-50'}`} />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <span className="text-sm font-semibold text-[#1F252E]">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => {
                  const globalIndex = startIndex + index;
                  return (
                    <React.Fragment key={user.id}>
                      {dragOverIndex !== null && dragFromIndex !== null && dragOverIndex === globalIndex && dragFromIndex !== globalIndex ? (
                        <tr className="h-0.5 transition-all duration-200">
                          <td colSpan={7} className="px-4 py-0">
                            <div className="h-0.5 bg-[#1F252E] opacity-60"></div>
                          </td>
                        </tr>
                      ) : null}

                      <tr
                        onDragEnter={(e) => onDragEnter(e, globalIndex)}
                        onDragOver={onDragOver}
                        onDrop={() => onDropAt(dragFromIndex ?? globalIndex, globalIndex)}
                        onMouseEnter={() => setHoveredRowIndex(globalIndex)}
                        onMouseLeave={() => setHoveredRowIndex(null)}
                        className={`border-b border-[#E1E7EF] last:border-b-0 ${
                          index % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white"
                        } transition-all duration-150 ease-out ${
                          dragFromIndex === globalIndex ? "opacity-50" : "opacity-100"
                        } group`}
                      >
                        <td className="px-4 py-3">
                          <div 
                            draggable
                            onDragStart={(e) => onDragStart(e, globalIndex)}
                            onDragEnd={onDragEnd}
                            className="flex items-center justify-center cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical 
                              className={`w-5 h-5 transition-all duration-150 ${
                                hoveredRowIndex === globalIndex || dragFromIndex === globalIndex
                                  ? "text-[#1F252E] opacity-100"
                                  : "text-[#65758B] opacity-0"
                              }`}
                            />
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-3">
                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                            <span className="text-sm text-[#1F252E]">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#65758B]">{user.email}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#1F252E]">{user.gender}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#1F252E]">{user.country}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#1F252E]">{user.age}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-4 h-4 text-[#1F252E]" />
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/cards view */}
          <div className="md:hidden px-3 py-3">
            <div className="space-y-3">
              {currentUsers.map((user, idx) => {
                const globalIdx = startIndex + idx;
                return (
                  <React.Fragment key={user.id}>
                    {dragOverIndex !== null && dragFromIndex !== null && dragOverIndex === globalIdx && dragFromIndex !== globalIdx ? (
                      <div className="h-0.5 transition-all duration-200 mb-3">
                        <div className="h-0.5 bg-[#1F252E] opacity-60"></div>
                      </div>
                    ) : null}
                    <div
                      onDragEnter={(e) => onDragEnter(e, globalIdx)}
                      onDragOver={onDragOver}
                      onDrop={() => onDropAt(dragFromIndex ?? globalIdx, globalIdx)}
                      className={`flex items-center gap-4 bg-white border border-[#E1E7EF] rounded-md p-3 transition-all duration-150 ease-out ${
                        dragFromIndex === globalIdx ? "opacity-50" : "opacity-100"
                      }`}
                    >
                      <div 
                        draggable
                        onDragStart={(e) => onDragStart(e, globalIdx)}
                        onDragEnd={onDragEnd}
                        onTouchStart={() => setHoveredRowIndex(globalIdx)}
                        onTouchEnd={() => setHoveredRowIndex(null)}
                        className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
                      >
                        <GripVertical 
                          className={`w-5 h-5 transition-all duration-150 ${
                            hoveredRowIndex === globalIdx || dragFromIndex === globalIdx
                              ? "text-[#1F252E] opacity-100"
                              : "text-[#65758B] opacity-40"
                          }`}
                        />
                      </div>
                  <div className="flex-shrink-0">
                    <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-[#1F252E] truncate">{user.name}</h3>
                      <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
                        <MoreVertical className="w-4 h-4 text-[#1F252E]" />
                      </button>
                    </div>
                    <p className="text-sm text-[#65758B] truncate">{user.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#1F252E]">
                      <span>{user.gender}</span>
                      <span className="mx-1">•</span>
                      <span>{user.country}</span>
                      <span className="mx-1">•</span>
                      <span>{user.age} yrs</span>
                    </div>
                    </div>
                  </div>
                </React.Fragment>
              );})}
            </div>
          </div>

          <div className="border-t border-[#E1E7EF] px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[#65758B]">
              Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#65758B]">Rows per page:</span>
                <div className="relative">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 pl-3 pr-8 rounded-md border border-[#E1E7EF] bg-[#FAFAFA] text-sm text-[#1F252E] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F252E] focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F252E] opacity-50 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={goToFirstPage} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E1E7EF] bg-[#FAFAFA] disabled:opacity-50 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed">
                  <ChevronsLeft className="w-4 h-4 text-[#1F252E]" />
                </button>
                <button onClick={goToPreviousPage} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E1E7EF] bg-[#FAFAFA] disabled:opacity-50 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4 text-[#1F252E]" />
                </button>
                <div className="px-2 flex items-center gap-1">
                  <span className="text-sm text-[#1F252E]">{currentPage}</span>
                  <span className="text-sm text-[#65758B]">of {totalPages}</span>
                </div>
                <button onClick={goToNextPage} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E1E7EF] bg-[#FAFAFA] disabled:opacity-50 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4 text-[#1F252E]" />
                </button>
                <button onClick={goToLastPage} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E1E7EF] bg-[#FAFAFA] disabled:opacity-50 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed">
                  <ChevronsRight className="w-4 h-4 text-[#1F252E]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
