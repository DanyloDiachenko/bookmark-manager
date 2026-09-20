import { IFolder } from '../../aside/folders/folders.types';
import { ITag } from '../../aside/tags/tags.types';

export interface IBookmark {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
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
  tagIds?: string[];
  isStarred?: boolean;
  isReadLater?: boolean;
}

export interface UpdateBookmarkRequest extends Partial<CreateBookmarkRequest> {}

export interface BookmarkFilterParams {
  isStarred?: boolean;
  isReadLater?: boolean;
  folderId?: string;
  tagId?: string;
  search?: string;
}

export type BookmarkResponse = IBookmark;
export type GetBookmarksResponse = IBookmark[];
