'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, User, Shield, Bell, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    appName: 'T-Go Angkot Digital',
    contactEmail: 'admin@tgo.com',
    maintenanceMode: false,
    enableRegistration: true,
    baseFare: 3000
  });

  // Profile Settings State
  const [profileSettings, setProfileSettings] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileSettings(prev => ({
        ...prev,
        email: user.email || ''
      }));
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setProfileSettings(prev => ({
          ...prev,
          fullName: data.full_name || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSystemSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Pengaturan sistem berhasil disimpan');
    setLoading(false);
  };

  const handleProfileSave = async () => {
    if (profileSettings.newPassword && profileSettings.newPassword !== profileSettings.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }

    setLoading(true);
    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: profileSettings.fullName })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Update password if provided
      if (profileSettings.newPassword) {
        const { error: authError } = await supabase.auth.updateUser({
          password: profileSettings.newPassword
        });
        if (authError) throw authError;
        toast.success('Profil dan password berhasil diperbarui');
      } else {
        toast.success('Profil berhasil diperbarui');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
        <p className="text-gray-500">Kelola konfigurasi sistem dan akun admin</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Informasi Aplikasi
              </CardTitle>
              <CardDescription>Konfigurasi dasar aplikasi T-Go</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="appName">Nama Aplikasi</Label>
                <Input 
                  id="appName" 
                  value={systemSettings.appName}
                  onChange={(e) => setSystemSettings({...systemSettings, appName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Email Kontak Support</Label>
                <Input 
                  id="contactEmail" 
                  type="email"
                  value={systemSettings.contactEmail}
                  onChange={(e) => setSystemSettings({...systemSettings, contactEmail: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseFare">Tarif Dasar (Rp)</Label>
                <Input 
                  id="baseFare" 
                  type="number"
                  value={systemSettings.baseFare}
                  onChange={(e) => setSystemSettings({...systemSettings, baseFare: parseInt(e.target.value)})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Zona Bahaya
              </CardTitle>
              <CardDescription>Pengaturan sensitif sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Mode Maintenance</Label>
                  <p className="text-sm text-gray-500">
                    Nonaktifkan akses pengguna sementara waktu
                  </p>
                </div>
                <Switch 
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Registrasi Pengguna</Label>
                  <p className="text-sm text-gray-500">
                    Izinkan pengguna baru mendaftar
                  </p>
                </div>
                <Switch 
                  checked={systemSettings.enableRegistration}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableRegistration: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSystemSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </Button>
          </div>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Profil Admin
              </CardTitle>
              <CardDescription>Kelola informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input 
                  id="fullName" 
                  value={profileSettings.fullName}
                  onChange={(e) => setProfileSettings({...profileSettings, fullName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={profileSettings.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <Separator className="my-4" />
              <h3 className="font-semibold text-gray-800">Ganti Password</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input 
                  id="newPassword" 
                  type="password"
                  value={profileSettings.newPassword}
                  onChange={(e) => setProfileSettings({...profileSettings, newPassword: e.target.value})}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  value={profileSettings.confirmPassword}
                  onChange={(e) => setProfileSettings({...profileSettings, confirmPassword: e.target.value})}
                  placeholder="Ulangi password baru"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleProfileSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Update Profil
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Settings (Dummy) */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Preferensi Notifikasi
              </CardTitle>
              <CardDescription>Atur notifikasi yang ingin Anda terima</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifikasi Pesanan Baru</Label>
                  <p className="text-sm text-gray-500">
                    Terima email saat ada pesanan tiket baru
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Laporan Harian</Label>
                  <p className="text-sm text-gray-500">
                    Terima ringkasan statistik harian via email
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
