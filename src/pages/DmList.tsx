import { Link } from "react-router-dom";
import { dmThreads } from "../data/mock";

export function DmList() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold">PM</h1>
      <div className="mt-3 space-y-2">
        {dmThreads.map((c) => (
          <Link
            key={c.id}
            to={`/dm/${c.id}`}
            className="block rounded-lg border p-3"
          >
            <div className="font-medium">{c.title}</div>
            <div className="text-sm text-muted-foreground">{c.lastMessage}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
