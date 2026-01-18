// app/admin/users/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, Eye, Download, User, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useThemeStore } from "@/lib/store";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Try to fetch via secure RPC first
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_admin_users');

      if (!rpcError && rpcData) {
        setUsers(rpcData || []);
      } else {
         console.warn("RPC get_admin_users failed, falling back", rpcError);
         // Fallback
         const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          setUsers(data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredUsers = users.filter((user) => {
    return (
      (user.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.id || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className={`p-6 space-y-6 min-h-full ${isDarkMode ? 'bg-[#121216] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Manajemen Pengguna</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Kelola data dan profil pengguna T-Go.
          </p>
        </div>
        <Button variant="outline" className={`gap-2 ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white'}`}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border shadow-sm border-l-4 border-l-purple-500 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 border-l-purple-500' : 'bg-white border-gray-100'}`}>
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
                <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Pengguna</p>
                    <h3 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{users.length}</h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
                    <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
             </div>
          </CardContent>
        </Card>
        <Card className={`border shadow-sm border-l-4 border-l-emerald-500 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 border-l-emerald-500' : 'bg-white border-gray-100'}`}>
           <CardContent className="p-5">
             <div className="flex justify-between items-start">
                <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">User Baru (Bulan Ini)</p>
                    <h3 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {users.filter(u => {
                            if (!u.created_at) return false;
                            const date = new Date(u.created_at);
                            const now = new Date();
                            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                        }).length}
                    </h3>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg dark:bg-emerald-900/20">
                    <ArrowUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
             </div>
          </CardContent>
        </Card>
        <Card className={`border shadow-sm border-l-4 border-l-blue-500 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 border-l-blue-500' : 'bg-white border-gray-100'}`}>
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
                <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pengguna Aktif</p>
                     {/* Mock active users (e.g. users with recent tickets) - simplifying for now */}
                    <h3 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Math.floor(users.length * 0.75)}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <div className={`rounded-xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100 shadow-gray-200/50'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                placeholder="Cari Nama, Telepon, atau ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 h-10 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200'}`}
                />
            </div>
        </div>

        <Table>
          <TableHeader className={isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
            <TableRow className={isDarkMode ? 'border-gray-800 hover:bg-transparent' : 'border-gray-100 hover:bg-transparent'}>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-gray-500 text-xs font-bold mt-2 uppercase tracking-wider">Memuat data...</p>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                       <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Tidak ada pengguna ditemukan.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} className={`transition-colors ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50/80'}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-700 shadow-sm">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold">
                          {user.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className={`font-bold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{user.full_name || 'Tanpa Nama'}</div>
                        <div className="text-[10px] text-gray-500 font-mono tracking-wide">{user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm ${user.phone ? (isDarkMode ? 'text-gray-300' : 'text-gray-700') : 'text-gray-400 italic'}`}>{user.phone || 'Belum diisi'}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className={isDarkMode ? 'text-purple-400 hover:bg-purple-900/20 hover:text-purple-300' : 'text-purple-600 hover:bg-purple-50'}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className={`p-4 border-t flex items-center justify-between ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
             <p className="text-xs text-gray-500 font-medium">
                {filteredUsers.length > 0 ? (
                    <>
                        {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length}
                    </>
                ) : '0 data'}
             </p>
             <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 text-xs ${isDarkMode ? 'bg-transparent border-gray-700 text-gray-300 disabled:opacity-30' : ''}`}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Prev
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 text-xs ${isDarkMode ? 'bg-transparent border-gray-700 text-gray-300 disabled:opacity-30' : ''}`}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
             </div>
        </div>
      </div>
    </div>
  );
}
