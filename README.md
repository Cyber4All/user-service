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

#### On Error
status | body | statusText
---|---|---
`401` | `Invalid access token` | `Unauthorized`

### `DELETE /users/:username/tokens` - Delete tokens (logout)
status | body | statusText
---|---|---
| `Error: Cannot log out at this time` |
