# user-service

A microservice for handling user account actions in the CLARK platform.

## Routes

### /users

| Request Type | Request Body | Type | Description |
| --- | --- | --- | --- |
| GET |  |  |  |
| POST | `email` | `string` | User's email address |

| Response Body | Type | Description |
| --- | --- | --- |
| GET |  |  |
| "Welcome to the Users API" | `string` | Welcome message |
| POST |  |  |
| "Invalid registration credentials" | `string` | If invalid or empty credentials are provided, an error is returned |

### `POST /users/tokens` - Create a new token for a user (log in)
Request | []() | []()
---|---|---
`username` | `string` | user's unique name
`password` | `string`|user's password
`email` | `string` | user's unique email address

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

### `DELETE /users/tokens` - Delete a user account
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

### `GET /users/:username` -

#### On Success
status | body | statusText
---|---|---
`200` | `{message: "Welcome to the users API v1.0.0", "version": "1.0.0"}` |`OK`

### `HEAD /users/:username` - 
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
| |

### `POST /users/:username` - Validate token
Request | []() | []()
---|---|---
`username` | `string` | user's unique name
`password` | `string` | user's password
`email` | `string` | user's unique email address

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
`400` | `Invalid registration credentials` | `Bad Request`
`420` | `Email is already in use` | `unknown`
