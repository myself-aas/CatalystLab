import { doc, updateDoc, increment, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Profile } from './types';

// Weights for Reputation Points Calculation
const ACTION_WEIGHTS = {
  created_post: 2,
  shared_paper: 10,
  added_dataset: 15,
  annotated: 5,
  created_list: 3,
  created_idea: 8,
  gained_follower: 5,
};

type ActionType = keyof typeof ACTION_WEIGHTS;

/**
 * Update the user's reputation score and activity log simultaneously.
 */
export async function updateUserReputation(
  userId: string, 
  action: ActionType, 
  targetId: string | null = null,
  targetType: string | null = null,
  description: string = ''
) {
  try {
    const points = ACTION_WEIGHTS[action] || 0;
    
    // Update the Profile doc directly (Counters are kept on the profile, keeping size small)
    const userRef = doc(db, 'users', userId);
    
    // Determine which count to increment based on action
    const updates: Record<string, any> = {
      reputation_score: increment(points),
      updated_at: new Date().toISOString()
    };
    
    switch (action) {
      case 'created_post': updates.posts_count = increment(1); break;
      case 'shared_paper': updates.papers_shared_count = increment(1); break;
      case 'added_dataset': updates.datasets_count = increment(1); break; // Note: needs to be added to Profile interface if required
      case 'annotated': updates.annotations_count = increment(1); break;
      // You can add list_count and idea_count to Profile interface if you want them strictly tracked
    }

    await updateDoc(userRef, updates);

    // Create a private ActivityLog in the roots collection
    const activityRef = collection(db, 'activities');
    await addDoc(activityRef, {
      user_id: userId,
      action_type: action,
      target_id: targetId,
      target_type: targetType,
      description: description,
      points_change: points,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to update reputation:', error);
  }
}

/**
 * Update the user's Research DNA based on an array of hashtags/keywords used.
 * We enforce a cap of the top 50 keywords so the users document stays < 50KB.
 */
export async function updateResearchDNA(userId: string, tags: string[]) {
  if (!tags || tags.length === 0) return;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    
    const profile = userSnap.data() as Profile;
    const currentTallies = profile.dna_tallies || {};
    
    // Increment tallies
    tags.forEach(tag => {
      const normalized = tag.toLowerCase().trim();
      currentTallies[normalized] = (currentTallies[normalized] || 0) + 1;
    });

    // Optionally sort and keep only the top 50 to ensure strict 50KB limit adherence
    const sortedTags = Object.entries(currentTallies).sort((a, b) => b[1] - a[1]);
    const cappedTallies = Object.fromEntries(sortedTags.slice(0, 50));
    
    // Update the profile research_interests with the top 5 directly so UI renders beautifully
    const topInterests = sortedTags.slice(0, 5).map(arr => arr[0]);

    await updateDoc(userRef, {
      dna_tallies: cappedTallies,
      research_interests: topInterests,
      updated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to update Research DNA:', error);
  }
}
