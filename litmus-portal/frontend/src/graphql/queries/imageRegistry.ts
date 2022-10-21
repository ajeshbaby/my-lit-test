import { gql } from '@apollo/client';

// GetImageRegistry
export const LIST_IMAGE_REGISTRY_BY_PROJECT_ID = gql`
  query listImageRegistry($data: String!) {
    listImageRegistry(projectID: $data) {
      imageRegistryInfo {
        enableRegistry
        isDefault
      }
      imageRegistryID
    }
  }
`;

// getImageRegistry
export const GET_IMAGE_REGISTRY = gql`
  query getImageRegistry($imageRegistryID: String!, $projectID: String!) {
    getImageRegistry(imageRegistryID: $imageRegistryID, projectID: $projectID) {
      imageRegistryInfo {
        isDefault
        enableRegistry
        secretName
        secretNamespace
        imageRegistryName
        imageRepoName
        imageRegistryType
      }
      imageRegistryID
    }
  }
`;
