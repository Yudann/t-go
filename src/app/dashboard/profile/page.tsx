"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  User,
  Mail,
  Phone,
  LogOut,
  Save,
  Shield,
  Bell,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Camera,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Profile {
  full_name: string;
  phone: string;
}

const DashboardProfile = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        user_id: user?.id,
        full_name: profile.full_name,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Profil berhasil diperbarui");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      router.push("/login");
      toast.success("Berhasil logout");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Gagal logout");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-purple-50 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50 to-white pb-20">
      {/* Header */}
      <header className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Profil Saya</h1>
          <p className="text-purple-100 text-sm">
            Kelola informasi akun dan pengaturan
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-linear-to-r from-purple-600 to-blue-600 h-20" />
          <CardContent className="p-6 -mt-16">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-linear-to-r from-purple-500 to-blue-500 text-white text-xl font-bold">
                    {getInitials(profile.full_name || user?.email || "U")}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {profile.full_name || "Pengguna"}
                </h2>
                <p className="text-gray-600 text-sm mt-1">{user?.email}</p>
                <Badge
                  variant="secondary"
                  className="mt-2 bg-purple-100 text-purple-700"
                >
                  T-Go User
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Member sejak
                </span>
                <span className="text-sm text-gray-800">
                  {new Date(user?.created_at || "").toLocaleDateString(
                    "id-ID",
                    {
                      year: "numeric",
                      month: "long",
                    }
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Status
                </span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Aktif
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Section */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Edit3 className="w-5 h-5 text-purple-600" />
              Edit Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50 border-gray-200 text-gray-600"
                />
                <p className="text-xs text-gray-500">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Nama Lengkap
                </Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => {
                    setProfile({ ...profile, full_name: e.target.value });
                    setIsEditing(true);
                  }}
                  placeholder="Masukkan nama lengkap"
                  className="border-gray-200 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Phone className="w-4 h-4 text-gray-500" />
                  Nomor Telepon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile({ ...profile, phone: e.target.value });
                    setIsEditing(true);
                  }}
                  placeholder="08123456789"
                  className="border-gray-200 focus:border-purple-500"
                />
              </div>
            </div>

            {(isEditing || saving) && (
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  disabled={saving}
                  className="flex-1 border-gray-300"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !isEditing}
                  className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Settings */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Pengaturan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {/* Notifications */}
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Notifikasi</p>
                    <p className="text-sm text-gray-600">
                      Kelola notifikasi aplikasi
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Security */}
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Keamanan</p>
                    <p className="text-sm text-gray-600">
                      Kata sandi & keamanan akun
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Payment */}
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Pembayaran</p>
                    <p className="text-sm text-gray-600">Metode pembayaran</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Help */}
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Bantuan</p>
                    <p className="text-sm text-gray-600">
                      Pusat bantuan & dukungan
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar dari Akun
            </Button>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center">
          <p className="text-sm text-gray-500">T-Go App v1.0.0</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default DashboardProfile;
