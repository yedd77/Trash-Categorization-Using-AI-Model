import { useState } from "react";
import {
    collection,
    getDocs,
    deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";

export default function CleanupPage() {
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState([]);

    const addLog = (msg) => setLog((prev) => [...prev, msg]);

    const deleteTrashDocs = async () => {
    setLoading(true);
    setLog([]);

    try {
        const snapshot = await getDocs(collection(db, "Points"));

        addLog(`Found ${snapshot.size} documents`);

        const paperDocs = snapshot.docs.filter(
            (docSnap) => docSnap.data().itemType === "Paper"
        );

        addLog(`Found ${paperDocs.length} Paper documents`);

        if (paperDocs.length <= 30) {
            addLog("✅ Paper documents already 30 or fewer");
            setLoading(false);
            return;
        }

        // Shuffle randomly
        const shuffled = [...paperDocs].sort(() => Math.random() - 0.5);

        // Keep 30, delete the rest
        const docsToDelete = shuffled.slice(30);

        let deletedCount = 0;

        for (const docSnap of docsToDelete) {
            await deleteDoc(docSnap.ref);

            deletedCount++;
            addLog(`Deleted: ${docSnap.id}`);

            if (deletedCount % 50 === 0) {
                addLog(`Progress: ${deletedCount}/${docsToDelete.length}`);
            }
        }

        addLog(`✅ Deleted ${deletedCount} Paper documents`);
        addLog(`✅ Remaining Paper documents: 30`);

    } catch (err) {
        console.error(err);
        addLog("❌ Error: " + err.message);
    }

    setLoading(false);
};

    return (
        <div style={{ padding: 20 }}>
            <h2>Cleanup Points Collection</h2>

            <button onClick={deleteTrashDocs} disabled={loading}>
                {loading ? "Processing..." : "Keep valid itemTypes only"}
            </button>

            <pre style={{ marginTop: 20, background: "#111", color: "#0f0", padding: 10 }}>
                {log.join("\n")}
            </pre>
        </div>
    );
}