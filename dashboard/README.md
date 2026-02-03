# MATLAB Dashboard (Next.js)

## Setup
1. Place MAT files in `dashboard/data/` with names like:
   - `group1_combined.mat`
   - `group2_combined.mat`
   - ...
   - `group7_combined.mat`
2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

## API
- `GET /api/meta?group=1`
- `GET /api/vector?name=alpha|eta&group=1`
- `GET /api/series?name=ELBO&group=1`
- `GET /api/subjects?name=mu|beta&group=1`
