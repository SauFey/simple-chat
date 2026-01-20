import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Shuffle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateRandomName } from '@/lib/randomNames';

interface WelcomeScreenProps {
  onJoin: (username: string) => Promise<unknown>;
  loading?: boolean;
}

export const WelcomeScreen = ({ onJoin, loading }: WelcomeScreenProps) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRandomName = () => {
    setUsername(generateRandomName());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onJoin(username);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
          >
            <MessageCircle className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Välkommen till Chatten
          </h1>
          <p className="text-muted-foreground">
            Välj ett användarnamn eller få ett slumpmässigt
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4 bg-card p-6 rounded-2xl shadow-card-soft border border-border"
        >
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-foreground">
              Användarnamn
            </label>
            <div className="flex gap-2">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ange namn eller lämna tomt..."
                className="flex-1"
                maxLength={30}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRandomName}
                title="Slumpa namn"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Lämna tomt för att få ett slumpmässigt namn
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              'Ansluter...'
            ) : (
              <>
                Gå med i chatten
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.form>
      </motion.div>
    </div>
  );
};
