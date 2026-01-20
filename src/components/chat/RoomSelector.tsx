import { motion } from 'framer-motion';
import { Hash, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatRoom } from '@/hooks/useChatRooms';

interface RoomSelectorProps {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export const RoomSelector = ({ rooms, currentRoomId, onSelectRoom }: RoomSelectorProps) => {
  return (
    <div className="flex gap-2 p-3 bg-card border-b border-border overflow-x-auto">
      {rooms.map((room) => (
        <motion.button
          key={room.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRoom(room.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
            currentRoomId === room.id
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {room.name === 'Global' ? (
            <Users className="w-4 h-4" />
          ) : (
            <Hash className="w-4 h-4" />
          )}
          {room.name}
        </motion.button>
      ))}
    </div>
  );
};
