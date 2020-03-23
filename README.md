# user-service

[![Greenkeeper badge](https://badges.greenkeeper.io/Cyber4All/user-service.svg)](https://greenkeeper.io/)

A microservice for handling user account actions in the CLARK platform.

## Testing
This microservice uses [jest](https://facebook.github.io/jest/ "Jest's Homepage") for running it's tests. Unit tests should be written in a `spec.ts` file. For instance, when testing `HelloWorld.js` the corresponding tests should be written in `HelloWorld.spec.js` and placed in the same directory.

Run all unit tests with `npm run test`

## Debugging
This service is configured to be compatible with VS Code's debugger. To start the service in debug mode, open the debugger tab and VS Code and use the `Start Service` configuration.

## Routes

### `POST /users` - Register a new account
Request | []() | []()
---|---|---
`username` | `string` | user's unique account name
`firstname` | `string` | user's first name
`lastname`| `string` | user's last name
`email` | `string` | user's unique email
`organization` | `string` | user's affiliated organization
`objects` | object | contains two strings - the user's password, and the confirmation of that password

#### On Success
Response | []() | []()
---|---|---
`_username` | `string` | user's unique account name
`_firstname` | `string` | user's first name
`_lastname`| `string` | user's last name
`_email` | `string` | user's unique email
`_organization` | `string` | user's affiliated organization
`_objects` | object | contains two strings - the user's password, and the confirmation of that password


#### On Error
status | body | statusText
---|---|---
| "Invalid registration credentials" | `string` | If invalid or empty credentials are provided, an error is returned |

### `POST /users/tokens` - Create a new token for a user (log in)
Request | []() | []()
---|---|---
`username` | `string` | user's unique name
`password` | `string`|user's password

#### On Success
Response | []() | []()
---|---|---
`_username` | `string` | user's unique username
`_name` | `string` | user's first and last name (concatenated)
`_email` | `string` | user's unique email address
`_objects` | [LearningObject[]](https://github.com/Cyber4All/clark-entity#LearningObject) | user's learning objects
`token` | `string` | user's access token

#### On Error
status | body | statusText
---|---|---
`400` | `{ message: "Invalid username or password" }` | `Bad Request`

### `DELETE /users/tokens` - Delete a user account (todo)
Request | []() | []()
---|---|---
| |

#### On Success
Response | []() | []()
---|---|---
| | 

#### On Error
status | body | statusText
---|---|---
`400` | `Cannot delete user accounts at this time` | `Bad Request`

### `DELETE /users/:username` 

#### On Error
status | body | statusText
---|---|---
`400` | `Cannnot delete user accounts at this time` | `Bad Request`

### `POST /users/:username/tokens` - Validate tokens (login)
Request | []() | []()
---|---|---
`token` | `string` | user's access token

### On Success
status | body | statusText
---|---|---
`200` | `OK` | `OK`

#### On Error
status | body | statusText
---|---|---
`401` | `Invalid access token` | `Unauthorized`

### `DELETE /users/:username/tokens` - Delete tokens (logout)
status | body | statusText
---|---|---
`Error` | `Cannot log out at this time` |

### Access Groups

#### Admin

- see all objects in review

- edit objects in review

- create revisions of released Learning Objects

- assign collection Curators and Reviewers

#### Editor

- see all objects in review

- edit objects in review

- create revisions of released Learning Objects

#### Reviewer@<CollectionName>

- see all Learning Objects in review for a given Collection

#### Curator@<CollectionName>

- see all Learning Objects in review for a given Collection

- assign and remove Reviewers for a given Collection


#### Mapper

- see all released Learning Objects in the system

- edit the mappings of Learning Outcomes in the system. They will have access to the Mapping dashboard and the Mapping builder

- add Curricular Guidelines to our system

- "retire" Curricular Guidelines as new ones replace them
