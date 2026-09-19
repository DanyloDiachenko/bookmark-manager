export interface IFolder {
  id: string;
  title: string;
  color: string;
  bookmarksCount: number;
}

export interface CreateFolderRequest {
  title: string;
  color: string;
}

export interface UpdateFolderRequest {
  title: string;
  color: string;
}

export type GetFoldersResponse = IFolder[];
