import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { GROUP_OPTIONS } from "../lib/constants";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function TrainingPage() {
  const [group, setGroup] = useState(1);
  const [series, setSeries] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/series?name=ELBO&group=${group}`).then((res) => res.json()),
      fetch(`/api/meta?group=${group}`).then((res) => res.json()),
    ])
      .then(([seriesPayload, metaPayload]) => {
        if (!active) return;
        setSeries(seriesPayload.values || []);
        setMeta(metaPayload || {});
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [group]);

  return (
    <main>
      <header>
        <div>
          <h1>Training Dashboard</h1>
          <p className="notice">ELBO trajectory and convergence metadata.</p>
        </div>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/params">Params</Link>
        </nav>
      </header>

      <section>
        <div className="controls">
          <div className="control">
            <label htmlFor="group">Group</label>
            <select
              id="group"
              value={group}
              onChange={(event) => setGroup(Number(event.target.value))}
            >
              {GROUP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  group{option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        {loading && <p className="notice">Loading ELBO series...</p>}
        {error && <p className="notice">Error: {error}</p>}
        {!loading && !error && (
          <Plot
            data={[
              {
                x: series.map((_, index) => index + 1),
                y: series,
                type: "scatter",
                mode: "lines",
                line: { color: "#0f172a", width: 2 },
                name: "ELBO",
              },
            ]}
            layout={{
              title: `group${group} · ELBO`,
              paper_bgcolor: "#ffffff",
              plot_bgcolor: "#ffffff",
              margin: { t: 50, l: 50, r: 20, b: 50 },
              xaxis: { title: "Iteration" },
              yaxis: { title: "ELBO" },
            }}
            style={{ width: "100%", height: 480 }}
            config={{ displayModeBar: true, responsive: true }}
          />
        )}
        <div className="badges" style={{ marginTop: 16 }}>
          <div className="badge">iter: {meta.iter ?? "-"}</div>
          <div className="badge">converged: {meta.converged ?? "-"}</div>
        </div>
      </section>
    </main>
  );
}
