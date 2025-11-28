import PublicProfileCardServer from './PublicProfileCardServer';
import type { PublicProfile } from '@/lib/profiles';

interface ServerProfileGridProps {
  profiles: PublicProfile[];
}

export default function ServerProfileGrid({ profiles }: ServerProfileGridProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          No profiles found
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Try adjusting your search criteria or browse all profiles.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {profiles.map((profile) => (
        <PublicProfileCardServer key={profile.id} profile={profile} />
      ))}
    </div>
  );
}

