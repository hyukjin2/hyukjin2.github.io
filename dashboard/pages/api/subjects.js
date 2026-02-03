import { loadGroupData, normalizeMatrix } from "../../lib/mat-loader";

export default function handler(req, res) {
  try {
    const { name, group = 1 } = req.query;
    if (!name || !["mu", "beta"].includes(name)) {
      res.status(400).json({ error: "name must be mu or beta" });
      return;
    }

    const data = loadGroupData(group);
    const matrix = normalizeMatrix(data[name]);

    res.status(200).json({ name, values: matrix });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
