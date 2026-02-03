import { loadGroupData, normalizeVector } from "../../lib/mat-loader";

export default function handler(req, res) {
  try {
    const { name, group = 1 } = req.query;
    if (!name || !["ELBO"].includes(name)) {
      res.status(400).json({ error: "name must be ELBO" });
      return;
    }

    const data = loadGroupData(group);
    const series = normalizeVector(data[name]);

    res.status(200).json({ name, values: series });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
