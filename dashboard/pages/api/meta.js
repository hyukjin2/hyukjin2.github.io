import { loadGroupData } from "../../lib/mat-loader";

export default function handler(req, res) {
  try {
    const { group = 1 } = req.query;
    const data = loadGroupData(group);
    const subjects = data.mu || data.beta || [];
    const nSubjects = Array.isArray(subjects) ? subjects.length : 0;

    res.status(200).json({
      n_subjects: nSubjects,
      iter: data.iter?.[0]?.[0] ?? data.iter ?? null,
      converged: data.converged?.[0]?.[0] ?? data.converged ?? null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
