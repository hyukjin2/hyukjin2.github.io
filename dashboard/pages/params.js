import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  GROUP_OPTIONS,
  NETWORK_LABELS,
  VECH_PAIRS,
} from "../lib/constants";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const PARAM_TYPES = [
  { value: "h", label: "h (network)" },
  { value: "j", label: "j (pair)" },
];

const DATA_SOURCES = [
  { value: "mu", label: "mu" },
  { value: "beta", label: "beta" },
];

function buildParamOptions(paramType) {
  if (paramType === "h") {
    return NETWORK_LABELS.map((label, index) => ({
      value: index + 1,
      label: `h${index + 1} · ${label}`,
    }));
  }

  return VECH_PAIRS.map(([left, right], index) => ({
    value: index + 1,
    label: `j${index + 1} · ${NETWORK_LABELS[left - 1]} / ${NETWORK_LABELS[
      right - 1
    ]}`,
  }));
}

function buildCsv(rows, header) {
  const lines = [header.join(",")];
  rows.forEach((row) => {
    lines.push(row.join(","));
  });
  return lines.join("\n");
}

export default function ParamsPage() {
  const [group, setGroup] = useState(1);
  const [dataSource, setDataSource] = useState("mu");
  const [paramType, setParamType] = useState("h");
  const [paramIndex, setParamIndex] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const options = useMemo(() => buildParamOptions(paramType), [paramType]);

  useEffect(() => {
    setParamIndex(1);
  }, [paramType]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/subjects?name=${dataSource}&group=${group}`)
      .then((res) => res.json())
      .then((payload) => {
        if (!active) return;
        setSubjects(payload.values || []);
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
  }, [dataSource, group]);

  const columnIndex = paramType === "h" ? paramIndex - 1 : paramIndex + 6;
  const values = subjects.map((row) => row[columnIndex]).filter((v) => v != null);

  const csvRows = values.map((value, index) => [index + 1, value]);

  const handleCsvDownload = () => {
    const csv = buildCsv(csvRows, ["subject", "value"]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `group${group}_${dataSource}_${paramType}${paramIndex}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePngDownload = async () => {
    const plotly = await import("plotly.js-dist-min");
    const node = document.getElementById("param-plot");
    if (!node) return;
    const data = node.data;
    const layout = node.layout;
    const image = await plotly.toImage({ data, layout }, { format: "png" });
    const link = document.createElement("a");
    link.href = image;
    link.download = `group${group}_${dataSource}_${paramType}${paramIndex}.png`;
    link.click();
  };

  return (
    <main>
      <header>
        <div>
          <h1>Params Dashboard</h1>
          <p className="notice">Subject-level distributions for mu/beta.</p>
        </div>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/training">Training</Link>
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
          <div className="control">
            <label htmlFor="source">Data source</label>
            <select
              id="source"
              value={dataSource}
              onChange={(event) => setDataSource(event.target.value)}
            >
              {DATA_SOURCES.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>
          <div className="control">
            <label htmlFor="paramType">Parameter type</label>
            <select
              id="paramType"
              value={paramType}
              onChange={(event) => setParamType(event.target.value)}
            >
              {PARAM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="control">
            <label htmlFor="paramIndex">Index</label>
            <select
              id="paramIndex"
              value={paramIndex}
              onChange={(event) => setParamIndex(Number(event.target.value))}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        {loading && <p className="notice">Loading subjects...</p>}
        {error && <p className="notice">Error: {error}</p>}
        {!loading && !error && (
          <Plot
            divId="param-plot"
            data={[
              {
                y: values,
                type: "box",
                name: `${dataSource} ${paramType}${paramIndex}`,
                boxpoints: "all",
                jitter: 0.4,
                pointpos: 0,
                marker: { color: "#0f172a", size: 6, opacity: 0.6 },
                line: { color: "#0f172a" },
              },
            ]}
            layout={{
              title: `group${group} · ${dataSource} ${paramType}${paramIndex}`,
              paper_bgcolor: "#ffffff",
              plot_bgcolor: "#ffffff",
              margin: { t: 50, l: 50, r: 20, b: 50 },
              xaxis: { showticklabels: false },
              yaxis: { title: "Value" },
            }}
            style={{ width: "100%", height: 480 }}
            config={{ displayModeBar: true, responsive: true }}
          />
        )}
        <div className="controls" style={{ marginTop: 16 }}>
          <button type="button" onClick={handleCsvDownload}>
            Download CSV
          </button>
          <button type="button" className="secondary" onClick={handlePngDownload}>
            Save PNG
          </button>
        </div>
      </section>
    </main>
  );
}
