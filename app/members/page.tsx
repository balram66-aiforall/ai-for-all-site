import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import {
  getSubscriptionByEmail,
  hasActiveAccess,
} from "../../lib/subscriptions";
import { SubscribeButton } from "../components/SubscribeButton";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const user = await requireChatGPTUser("/members");
  const subscription = await getSubscriptionByEmail(user.email);
  const hasAccess = hasActiveAccess(subscription);

  return (
    <main className="members-shell">
      <section className="members-panel" aria-labelledby="members-title">
        <a className="members-home" href="/">
          AIFA
        </a>
        <p className="members-kicker">₹100/month membership</p>
        <h1 id="members-title">
          {hasAccess ? "Members workspace" : "Subscribe to unlock AIFA"}
        </h1>
        <p className="members-copy">
          Signed in as {user.displayName}.{" "}
          <a href={chatGPTSignOutPath("/members")}>Sign out</a>
        </p>

        {hasAccess ? (
          <div className="resource-grid">
            <article>
              <h2>Prompt canvas</h2>
              <p>Use this space to shape messy ideas into clear AI-ready briefs.</p>
            </article>
            <article>
              <h2>Workflow notes</h2>
              <p>Simple patterns for context, examples, review loops, and output.</p>
            </article>
            <article>
              <h2>AIFA method</h2>
              <p>Clarify, frame, build, and ship with human judgment intact.</p>
            </article>
          </div>
        ) : (
          <div className="locked-panel">
            <p>
              Your account does not have an active Razorpay subscription yet.
              Subscribe for ₹100/month to unlock the member resources.
            </p>
            <SubscribeButton />
          </div>
        )}
      </section>
    </main>
  );
}
