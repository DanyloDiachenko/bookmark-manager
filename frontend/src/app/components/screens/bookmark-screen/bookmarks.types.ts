import { IFolder } from '../../aside/folders/folders.types';
import { ITag } from '../../aside/tags/tags.types';

export interface IBookmark {
  id: string;
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  isStarred: boolean;
  isReadLater: boolean;
  folder: IFolder | null;
  tags: ITag[];
}

export interface CreateBookmarkRequest {
  url: string;
  title?: string;
  description?: string;
  folderId?: string;
  folder?: string;
  tags?: string[];
  isStarred?: boolean;
  isReadLater?: boolean;
}

export interface BookmarkFilterParams {
  isStarred?: boolean;
  isReadLater?: boolean;
  folder?: string;
  folderId?: string;
  tag?: string;
  tagId?: string;
  search?: string;
}

export type BookmarkResponse = IBookmark;
export type GetBookmarksResponse = IBookmark[];
