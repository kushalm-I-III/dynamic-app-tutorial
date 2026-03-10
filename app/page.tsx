"use client";

import React, { useState } from "react";
import { id } from "@instantdb/react";

import db from "@/lib/db";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Login() {
  const [sentEmail, setSentEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {!sentEmail ? (
          <EmailStep onSendEmail={setSentEmail} />
        ) : (
          <CodeStep sentEmail={sentEmail} />
        )}
      </div>
    </div>
  );
}

function EmailStep({
  onSendEmail,
}: {
  onSendEmail: (email: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const email = inputEl.value;
    onSendEmail(email);
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert("Uh oh: " + (err.body?.message ?? err.message));
      onSendEmail("");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold text-stone-800">
        Sign in to share your poetry
      </h2>
      <p className="text-sm text-stone-600">
        Enter your email and we&apos;ll send you a verification code. We&apos;ll
        create an account if you don&apos;t have one yet.
      </p>
      <input
        ref={inputRef}
        type="email"
        className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        placeholder="Enter your email"
        required
        autoFocus
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        Send Code
      </button>
    </form>
  );
}

function CodeStep({ sentEmail }: { sentEmail: string }) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const code = inputEl.value;
    db.auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
      inputEl.value = "";
      alert("Uh oh: " + (err.body?.message ?? err.message));
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold text-stone-800">Enter your code</h2>
      <p className="text-sm text-stone-600">
        We sent an email to <strong>{sentEmail}</strong>. Check your inbox and
        paste the code below.
      </p>
      <input
        ref={inputRef}
        type="text"
        className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        placeholder="123456..."
        required
        autoFocus
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        Verify Code
      </button>
    </form>
  );
}

function PoemsFeed() {
  const { data, isLoading, error } = db.useQuery({
    poems: {
      $: { order: { createdAt: "desc" } },
      author: {},
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-stone-500">Loading poems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Error loading poems: {error.message}
      </div>
    );
  }

  const poems = data?.poems ?? [];

  if (poems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-12 text-center text-stone-500">
        <p>No poems yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {poems.map((poem) => (
        <article
          key={poem.id}
          className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-stone-800">{poem.title}</h3>
          <pre className="mt-2 whitespace-pre-wrap font-serif text-stone-700">
            {poem.body}
          </pre>
          <footer className="mt-4 flex items-center gap-2 text-sm text-stone-500">
            <span>{poem.author?.email ?? "Anonymous"}</span>
            <span>·</span>
            <time dateTime={new Date(poem.createdAt).toISOString()}>
              {formatDate(poem.createdAt)}
            </time>
          </footer>
        </article>
      ))}
    </div>
  );
}

function ComposeForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) return;

    db.transact(
      db.tx.poems[id()]
        .create({
          title: trimmedTitle,
          body: trimmedBody,
          createdAt: Date.now(),
        })
        .link({ author: userId }),
    );

    setTitle("");
    setBody("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-bold text-stone-800">Share a poem</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Your poem..."
          rows={6}
          className="w-full resize-none rounded-lg border border-stone-300 px-4 py-2 font-serif text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Publish
        </button>
      </div>
    </form>
  );
}

function Main() {
  const user = db.useUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Poetry Sharing</h1>
        <button
          onClick={() => db.auth.signOut()}
          className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 hover:text-stone-800"
        >
          Sign out
        </button>
      </header>

      <div className="space-y-8">
        {user && <ComposeForm userId={user.id} />}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            All poems
          </h2>
          <PoemsFeed />
        </section>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <db.SignedIn>
        <Main />
      </db.SignedIn>
      <db.SignedOut>
        <Login />
      </db.SignedOut>
    </>
  );
}
