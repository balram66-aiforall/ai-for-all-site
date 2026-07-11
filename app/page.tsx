import { SubscribeButton } from "./components/SubscribeButton";

export default function Home() {
  return (
    <main className="mock-shell" aria-labelledby="page-title">
      <h1 id="page-title" className="screen-reader-copy">
        AIFA website mock: AI, made usable.
      </h1>

      <section className="mock-stage" aria-label="AIFA charcoal website concept">
        <img
          className="mock-art"
          src="/assets/aifa-charcoal-website-concept.png"
          width="1024"
          height="1536"
          alt="AIFA charcoal sketch homepage mockup with headline AI, made usable, workflow board, training sections, and method steps."
        />

        <span id="workflows" className="anchor-target workflows-anchor" aria-hidden="true" />
        <span id="training" className="anchor-target section-anchor" aria-hidden="true" />
        <span id="systems" className="anchor-target section-anchor" aria-hidden="true" />
        <span id="output" className="anchor-target section-anchor" aria-hidden="true" />
        <span id="method" className="anchor-target method-anchor" aria-hidden="true" />

        <a className="hotspot brand-link" href="#" aria-label="AIFA home" />
        <a className="hotspot nav-workflows" href="#workflows" aria-label="Workflows" />
        <a className="hotspot nav-training" href="#training" aria-label="Training" />
        <a className="hotspot nav-systems" href="#systems" aria-label="Systems" />
        <a className="hotspot nav-output" href="#output" aria-label="Output" />
        <a className="hotspot cta-start" href="#workflows" aria-label="Start building" />
        <a className="hotspot cta-method" href="#method" aria-label="See method" />
        <a className="hotspot card-people" href="#training" aria-label="Train people" />
        <a className="hotspot card-ai" href="#systems" aria-label="Train AI" />
        <a className="hotspot card-output" href="#output" aria-label="Ship output" />
        <SubscribeButton className="subscribe-overlay" />
      </section>
    </main>
  );
}
