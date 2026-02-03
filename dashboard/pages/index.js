import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header>
        <div>
          <h1>MATLAB Dashboard</h1>
          <p className="notice">Select a dashboard view.</p>
        </div>
        <nav>
          <Link href="/params">Params</Link>
          <Link href="/training">Training</Link>
        </nav>
      </header>
      <section>
        <h2>Overview</h2>
        <p className="notice">
          Use the Params page to explore subject-level parameters (mu/beta) and
          export selections. Use the Training page to review ELBO trends with
          convergence metadata.
        </p>
      </section>
    </main>
  );
}
