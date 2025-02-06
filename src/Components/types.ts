// types.ts
export interface Note {
  id: number;
  title: string; // Changed from 'heading' to 'title'
  body: any; // Adjust the type based on your content
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  isLiked: boolean;
  isDisliked: boolean;
}
