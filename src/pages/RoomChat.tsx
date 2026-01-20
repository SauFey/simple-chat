import { useParams } from "react-router-dom";

export function RoomChat() {
  const { id } = useParams();
  return (
    <div className="p-4">
      <div className="text-sm text-muted-foreground">Rum</div>
      <h1 className="text-lg font-semibold">#{id}</h1>

      <div className="mt-4 space-y-2">
        <div className="w-fit max-w-[80%] rounded-xl border px-3 py-2 text-sm">
          Välkommen till rummet!
        </div>
      </div>
    </div>
  );
}
