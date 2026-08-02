// Tag model
// Converted from C# model in test/Tag.cs

import httpService, { type DeleteResponse } from '../services/http_service';

// Request parameter types
export interface TagListParams {
  name?: string;
  page?: number;
  perPage?: number;
}

export interface CreateTag {
  name: string;
}

export interface UpdateTag {
  name?: string;
}

export interface Tag {
  id: string;
  name: string;
}

// Helper function for string representation (equivalent to ToString() in C#)
export const tagToString = (tag: Tag): string => {
  return `Tag { id: ${tag.id}, name: "${tag.name}" }`;
};

// Service methods
export const tagService = {
  getAll: async (params?: TagListParams): Promise<Tag[]> => {
    const response = await httpService.get<Tag[]>('/tags', params || {});
    return response || [];
  },

  getById: async (id: string): Promise<Tag> => {
    const response = await httpService.get<Tag>(`/tags/${id}`, {});
    return response;
  },

  create: async (data: CreateTag): Promise<Tag> => {
    const response = await httpService.post<Tag>('/tags', data);
    return response;
  },

  update: async (id: string, data: UpdateTag): Promise<Tag> => {
    const response = await httpService.patch<Tag>(`/tags/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/tags/${id}`);
    return response;
  }
};
