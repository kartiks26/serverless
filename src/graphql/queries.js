/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($email: String!) {
    getUser(email: $email) {
      id
      name
      email
      phoneNum
      profilePic
      role
      studentDetails {
        id
        campus
        location
        joinedDate
        active
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $email: String
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listUsers(
      email: $email
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        email
        phoneNum
        profilePic
        role
        studentDetails {
          id
          campus
          location
          joinedDate
          active
        }
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
