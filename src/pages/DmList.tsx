import { Link } from "react-router-dom";
import { dmThreads } from "../data/mock";
import { useChatStore } from "@/stores/chatStore";

const requests = useChatStore((s) => s.dmRequests);
const accept = useChatStore((s) => s.acceptDmRequest);
const decline = useChatStore((s) => s.declineDmRequest);
const block = useChatStore((s) => s.blockUser);

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
        ,
        {requests.length > 0 && (
          <section className="p-4 space-y-2">
            <div className="text-sm font-medium">PM-förfrågningar</div>

            {requests.map((r) => (
              <div key={r.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      r.fromAvatarUrl ||
                      "https://api.dicebear.com/9.x/thumbs/svg?seed=User"
                    }
                    className="h-10 w-10 rounded-full border object-cover"
                    alt={r.fromName}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {r.fromName} vill prata med dig
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Skickat {new Date(r.createdAt).toLocaleString("sv-SE")}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    className="h-10 w-full rounded-md border text-sm hover:bg-muted transition"
                    onClick={() => accept(r.id)}
                  >
                    Acceptera
                  </button>
                  <button
                    className="h-10 w-full rounded-md border text-sm hover:bg-muted transition"
                    onClick={() => decline(r.id)}
                  >
                    Avvisa
                  </button>
                  <button
                    className="h-10 w-full rounded-md border text-sm hover:bg-muted transition"
                    onClick={() => block(r.fromUserId)}
                  >
                    Blockera
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
