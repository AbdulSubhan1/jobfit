// Keeps the job and CV in this browser tab while the user leaves for Google or GitHub to sign in.
// sessionStorage only: it never reaches the server and is gone when the tab closes.

const KEY = "jobfit:draft";

export type Draft = { job: string; cv: string; source: string | null };

export function saveDraft(draft: Draft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Private mode or storage blocked: the user just pastes again
  }
}

/** Returns the saved draft once, then forgets it. */
export function takeDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}
