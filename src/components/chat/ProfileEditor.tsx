import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Profile } from '@/hooks/useProfile';

interface ProfileEditorProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Profile>) => Promise<unknown>;
  
}

export const ProfileEditor = ({ profile, isOpen, onClose, onSave }: ProfileEditorProps) => {
  const [bio, setBio] = useState(profile.bio || '');
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [gender, setGender] = useState<Profile['gender']>(profile.gender);
  const [location, setLocation] = useState(profile.location || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        bio: bio || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        location: location || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{profile.username}</h2>
                  <p className="text-xs text-muted-foreground">Redigera din profil</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Berätta lite om dig själv..."
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Ålder</label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Din ålder"
                    min={13}
                    max={120}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Kön</label>
                  <Select value={gender || ''} onValueChange={(v) => setGender(v as Profile['gender'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="man">Man</SelectItem>
                      <SelectItem value="kvinna">Kvinna</SelectItem>
                      <SelectItem value="annat">Annat</SelectItem>
                      <SelectItem value="föredrar_att_inte_säga">Vill ej ange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ort</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Var bor du?"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Sparar...' : 'Spara ändringar'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
