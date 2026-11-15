import type { PlayerProfile } from '@mesa-viva/core';
import { useEffect, useState } from 'preact/hooks';
import { profileSnapshot, subscribeProfile } from './profile-store.js';

export function useProfile(): PlayerProfile {
  const [profile, setProfile] = useState(profileSnapshot());
  useEffect(() => subscribeProfile(() => setProfile(profileSnapshot())), []);
  return profile;
}
