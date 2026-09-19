export interface ITag {
  id: string;
  title: string;
}

export interface CreateTagRequest {
  title: string;
}

export type TagResponse = ITag;
export type GetTagsResponse = ITag[];
