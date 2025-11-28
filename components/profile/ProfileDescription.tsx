'use client';

interface ProfileDescriptionProps {
  description: string | null;
}

export default function ProfileDescription({ description }: ProfileDescriptionProps) {
  if (!description || description.trim() === '') {
    return null;
  }

  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: 'var(--nav-footer-bg)',
        border: '1px solid var(--nav-footer-border)',
      }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        About
      </h2>
      {/* Safe: React automatically escapes user content to prevent XSS */}
      {/* If HTML support is needed in the future, use DOMPurify for sanitization */}
      <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </div>
  );
}

